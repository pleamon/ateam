import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@shared/prisma/prisma.service';
import { CreateMindMapDto, CreateMindMapNodeDto } from '../dto/create-mindmap.dto';
import { PermissionService, Permission } from '../../auth/permission.service';

@Injectable()
export class MindMapService {
  constructor(
    private prisma: PrismaService,
    private permissionService: PermissionService,
  ) { }

  async create(createMindMapDto: CreateMindMapDto, userId: string) {
    const { projectId, ...mindMapData } = createMindMapDto;

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.DOCUMENTATION_CREATE,
      projectId,
    );

    const mindMap = await this.prisma.mindMap.create({
      data: {
        ...mindMapData,
        projectId,
        userId,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            nodes: true,
          },
        },
      },
    });

    // 创建根节点
    const rootNode = await this.prisma.mindMapNode.create({
      data: {
        mindMapId: mindMap.id,
        content: mindMap.title,
        nodeType: 'ROOT',
        position: 0,
        expanded: true,
      },
    });

    // 更新思维导图的根节点引用
    await this.prisma.mindMap.update({
      where: { id: mindMap.id },
      data: {
        nodeId: rootNode.id,
      },
    });

    // 记录审计日志
    await this.permissionService.logAction(userId, 'MINDMAP_CREATE', 'MINDMAP', mindMap.id, {
      title: mindMap.title,
      projectId,
    });

    return { ...mindMap, rootNode };
  }

  async findAll(userId: string, projectId?: string) {
    const where: any = { deletedAt: null };

    if (projectId) {
      // 检查用户权限
      await this.permissionService.requirePermission(
        userId,
        Permission.DOCUMENTATION_READ,
        projectId,
      );
      where.projectId = projectId;
    } else {
      // 只查看用户有权限的项目思维导图
      where.project = {
        members: {
          some: {
            userId,
          },
        },
      };
    }

    const mindMaps = await this.prisma.mindMap.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        rootNode: true,
        _count: {
          select: {
            nodes: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return mindMaps;
  }

  async findOne(id: string, userId: string) {
    const mindMap = await this.prisma.mindMap.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        rootNode: true,
        nodes: {
          orderBy: {
            position: 'asc',
          },
        },
      },
    });

    if (!mindMap || mindMap.deletedAt) {
      throw new NotFoundException('思维导图不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.DOCUMENTATION_READ,
      mindMap.projectId,
    );

    return mindMap;
  }

  async update(id: string, updateData: any, userId: string) {
    const existingMindMap = await this.prisma.mindMap.findUnique({
      where: { id },
      select: { projectId: true },
    });

    if (!existingMindMap) {
      throw new NotFoundException('思维导图不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.DOCUMENTATION_UPDATE,
      existingMindMap.projectId,
    );

    const mindMap = await this.prisma.mindMap.update({
      where: { id },
      data: {
        ...updateData,
        version: {
          increment: 1,
        },
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        rootNode: true,
        _count: {
          select: {
            nodes: true,
          },
        },
      },
    });

    // 记录审计日志
    await this.permissionService.logAction(userId, 'MINDMAP_UPDATE', 'MINDMAP', id, {
      changes: updateData,
    });

    return mindMap;
  }

  async remove(id: string, userId: string) {
    const existingMindMap = await this.prisma.mindMap.findUnique({
      where: { id },
      select: { projectId: true, title: true },
    });

    if (!existingMindMap) {
      throw new NotFoundException('思维导图不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.DOCUMENTATION_DELETE,
      existingMindMap.projectId,
    );

    // 软删除
    await this.prisma.mindMap.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    // 记录审计日志
    await this.permissionService.logAction(userId, 'MINDMAP_DELETE', 'MINDMAP', id, {
      title: existingMindMap.title,
    });

    return { message: '思维导图删除成功' };
  }

  // 节点管理
  async createNode(mindMapId: string, createNodeDto: CreateMindMapNodeDto, userId: string) {
    const mindMap = await this.prisma.mindMap.findUnique({
      where: { id: mindMapId },
      select: { projectId: true },
    });

    if (!mindMap) {
      throw new NotFoundException('思维导图不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.DOCUMENTATION_UPDATE,
      mindMap.projectId,
    );

    const node = await this.prisma.mindMapNode.create({
      data: {
        ...createNodeDto,
        mindMapId,
      },
    });

    // 更新思维导图版本
    await this.prisma.mindMap.update({
      where: { id: mindMapId },
      data: {
        version: {
          increment: 1,
        },
      },
    });

    return node;
  }

  async updateNode(nodeId: string, updateData: any, userId: string) {
    const node = await this.prisma.mindMapNode.findUnique({
      where: { id: nodeId },
      include: {
        mindMap: {
          select: {
            projectId: true,
          },
        },
      },
    });

    if (!node) {
      throw new NotFoundException('节点不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.DOCUMENTATION_UPDATE,
      node.mindMap.projectId,
    );

    const updatedNode = await this.prisma.mindMapNode.update({
      where: { id: nodeId },
      data: updateData,
    });

    // 更新思维导图版本
    await this.prisma.mindMap.update({
      where: { id: node.mindMapId },
      data: {
        version: {
          increment: 1,
        },
      },
    });

    return updatedNode;
  }

  async removeNode(nodeId: string, userId: string) {
    const node = await this.prisma.mindMapNode.findUnique({
      where: { id: nodeId },
      include: {
        mindMap: {
          select: {
            projectId: true,
          },
        },
        children: true,
      },
    });

    if (!node) {
      throw new NotFoundException('节点不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.DOCUMENTATION_UPDATE,
      node.mindMap.projectId,
    );

    // 不能删除根节点
    if (node.nodeType === 'ROOT') {
      throw new Error('不能删除根节点');
    }

    // 删除节点及其所有子节点
    await this.deleteNodeRecursive(nodeId);

    // 更新思维导图版本
    await this.prisma.mindMap.update({
      where: { id: node.mindMapId },
      data: {
        version: {
          increment: 1,
        },
      },
    });

    return { message: '节点删除成功' };
  }

  private async deleteNodeRecursive(nodeId: string) {
    // 获取所有子节点
    const children = await this.prisma.mindMapNode.findMany({
      where: { parentId: nodeId },
      select: { id: true },
    });

    // 递归删除子节点
    for (const child of children) {
      await this.deleteNodeRecursive(child.id);
    }

    // 删除当前节点
    await this.prisma.mindMapNode.delete({
      where: { id: nodeId },
    });
  }
}
