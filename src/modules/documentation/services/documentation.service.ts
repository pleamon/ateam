import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@shared/prisma/prisma.service';
import { CreateDocumentationDto, DocumentStatus } from '../dto/create-documentation.dto';
import { UpdateDocumentationDto } from '../dto/update-documentation.dto';
import { PermissionService, Permission } from '../../auth/permission.service';

@Injectable()
export class DocumentationService {
  constructor(
    private prisma: PrismaService,
    private permissionService: PermissionService,
  ) { }

  async create(createDocumentationDto: CreateDocumentationDto, userId: string) {
    const { projectId, tagIds, ...documentData } = createDocumentationDto;

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.DOCUMENTATION_CREATE,
      projectId,
    );

    const documentation = await this.prisma.documentation.create({
      data: {
        ...documentData,
        projectId,
        userId,
        tags: tagIds
          ? {
            connect: tagIds.map((id) => ({ id })),
          }
          : undefined,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        tags: true,
        _count: {
          select: {
            comments: true,
            attachments: true,
            versions: true,
          },
        },
      },
    });

    // 记录审计日志
    await this.permissionService.logAction(
      userId,
      'DOCUMENTATION_CREATE',
      'DOCUMENTATION',
      documentation.id,
      { title: documentation.title, projectId },
    );

    return documentation;
  }

  async findAll(userId: string, projectId?: string, filters?: any) {
    const where: any = {};

    if (projectId) {
      // 检查用户权限
      await this.permissionService.requirePermission(
        userId,
        Permission.DOCUMENTATION_READ,
        projectId,
      );
      where.projectId = projectId;
    } else {
      // 只查看用户有权限的项目文档
      where.project = {
        members: {
          some: {
            userId,
          },
        },
      };
    }

    // 应用过滤器
    if (filters?.type) where.type = filters.type;
    if (filters?.status) where.status = filters.status;
    if (filters?.visibility) where.visibility = filters.visibility;
    if (filters?.category) where.category = filters.category;

    // 软删除过滤
    where.deletedAt = null;

    const documentations = await this.prisma.documentation.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        tags: true,
        _count: {
          select: {
            comments: true,
            attachments: true,
            versions: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return documentations;
  }

  async findOne(id: string, userId: string) {
    const documentation = await this.prisma.documentation.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        tags: true,
        comments: {
          where: {
            parentId: null,
          },
          include: {
            User: {
              select: {
                id: true,
                username: true,
              },
            },
            replies: {
              include: {
                User: {
                  select: {
                    id: true,
                    username: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        attachments: {
          include: {
            User: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
        versions: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
        _count: {
          select: {
            comments: true,
            attachments: true,
            versions: true,
          },
        },
      },
    });

    if (!documentation || documentation.deletedAt) {
      throw new NotFoundException('文档不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.DOCUMENTATION_READ,
      documentation.projectId,
    );

    return documentation;
  }

  async update(id: string, updateDocumentationDto: UpdateDocumentationDto, userId: string) {
    const existingDoc = await this.prisma.documentation.findUnique({
      where: { id },
      select: { projectId: true, content: true, version: true },
    });

    if (!existingDoc) {
      throw new NotFoundException('文档不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.DOCUMENTATION_UPDATE,
      existingDoc.projectId,
    );

    const { tagIds, ...updateData } = updateDocumentationDto;

    // 创建版本历史
    if (updateData.content && updateData.content !== existingDoc.content) {
      await this.prisma.documentVersion.create({
        data: {
          documentationId: id,
          version: existingDoc.version,
          content: existingDoc.content,
          changeLog: '更新文档内容',
          userId,
        },
      });
    }

    const documentation = await this.prisma.documentation.update({
      where: { id },
      data: {
        ...updateData,
        versionNumber: {
          increment: 1,
        },
        tags: tagIds
          ? {
            set: tagIds.map((tagId) => ({ id: tagId })),
          }
          : undefined,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        tags: true,
        _count: {
          select: {
            comments: true,
            attachments: true,
            versions: true,
          },
        },
      },
    });

    // 记录审计日志
    await this.permissionService.logAction(userId, 'DOCUMENTATION_UPDATE', 'DOCUMENTATION', id, {
      changes: updateData,
    });

    return documentation;
  }

  async remove(id: string, userId: string) {
    const existingDoc = await this.prisma.documentation.findUnique({
      where: { id },
      select: { projectId: true, title: true },
    });

    if (!existingDoc) {
      throw new NotFoundException('文档不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.DOCUMENTATION_DELETE,
      existingDoc.projectId,
    );

    // 软删除
    await this.prisma.documentation.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    // 记录审计日志
    await this.permissionService.logAction(userId, 'DOCUMENTATION_DELETE', 'DOCUMENTATION', id, {
      title: existingDoc.title,
    });

    return { message: '文档删除成功' };
  }

  async publish(id: string, userId: string) {
    const existingDoc = await this.prisma.documentation.findUnique({
      where: { id },
      select: { projectId: true, status: true },
    });

    if (!existingDoc) {
      throw new NotFoundException('文档不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.DOCUMENTATION_UPDATE,
      existingDoc.projectId,
    );

    const documentation = await this.prisma.documentation.update({
      where: { id },
      data: {
        status: DocumentStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });

    // 记录审计日志
    await this.permissionService.logAction(userId, 'DOCUMENTATION_PUBLISH', 'DOCUMENTATION', id, {
      oldStatus: existingDoc.status,
      newStatus: DocumentStatus.PUBLISHED,
    });

    return documentation;
  }

  async createTag(name: string, description?: string, color?: string) {
    const tag = await this.prisma.documentTag.create({
      data: {
        name,
        description,
        color,
      },
    });

    return tag;
  }

  async getTags() {
    const tags = await this.prisma.documentTag.findMany({
      include: {
        _count: {
          select: {
            documentations: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return tags;
  }
}
