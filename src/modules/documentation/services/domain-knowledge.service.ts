import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@shared/prisma/prisma.service';
import {
  CreateDomainKnowledgeDto,
  CreateDomainConceptDto,
  CreateDomainPatternDto,
  CreateDomainBestPracticeDto,
} from '../dto/create-domain-knowledge.dto';
import { PermissionService, Permission } from '../../auth/permission.service';

@Injectable()
export class DomainKnowledgeService {
  constructor(
    private prisma: PrismaService,
    private permissionService: PermissionService,
  ) { }

  async create(createDomainKnowledgeDto: CreateDomainKnowledgeDto, userId: string) {
    const { projectId, ...knowledgeData } = createDomainKnowledgeDto;

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.DOCUMENTATION_CREATE,
      projectId,
    );

    const domainKnowledge = await this.prisma.domainKnowledge.create({
      data: {
        ...knowledgeData,
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
            concepts: true,
            patterns: true,
            bestPractices: true,
            antiPatterns: true,
            references: true,
          },
        },
      },
    });

    // 记录审计日志
    await this.permissionService.logAction(
      userId,
      'DOMAIN_KNOWLEDGE_CREATE',
      'DOMAIN_KNOWLEDGE',
      domainKnowledge.id,
      { domain: domainKnowledge.domain, projectId },
    );

    return domainKnowledge;
  }

  async findAll(userId: string, projectId?: string, filters?: any) {
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
      // 只查看用户有权限的项目知识库
      where.project = {
        members: {
          some: {
            userId,
          },
        },
      };
    }

    // 应用过滤器
    if (filters?.category) where.category = filters.category;
    if (filters?.domain) {
      where.domain = {
        contains: filters.domain,
        mode: 'insensitive',
      };
    }

    const knowledges = await this.prisma.domainKnowledge.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            concepts: true,
            patterns: true,
            bestPractices: true,
            antiPatterns: true,
            references: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return knowledges;
  }

  async findOne(id: string, userId: string) {
    const domainKnowledge = await this.prisma.domainKnowledge.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        concepts: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        patterns: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        bestPractices: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        antiPatterns: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        references: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            concepts: true,
            patterns: true,
            bestPractices: true,
            antiPatterns: true,
            references: true,
          },
        },
      },
    });

    if (!domainKnowledge || domainKnowledge.deletedAt) {
      throw new NotFoundException('领域知识不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.DOCUMENTATION_READ,
      domainKnowledge.projectId,
    );

    return domainKnowledge;
  }

  async update(id: string, updateData: any, userId: string) {
    const existingKnowledge = await this.prisma.domainKnowledge.findUnique({
      where: { id },
      select: { projectId: true },
    });

    if (!existingKnowledge) {
      throw new NotFoundException('领域知识不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.DOCUMENTATION_UPDATE,
      existingKnowledge.projectId,
    );

    const domainKnowledge = await this.prisma.domainKnowledge.update({
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
        _count: {
          select: {
            concepts: true,
            patterns: true,
            bestPractices: true,
            antiPatterns: true,
            references: true,
          },
        },
      },
    });

    // 记录审计日志
    await this.permissionService.logAction(
      userId,
      'DOMAIN_KNOWLEDGE_UPDATE',
      'DOMAIN_KNOWLEDGE',
      id,
      { changes: updateData },
    );

    return domainKnowledge;
  }

  async remove(id: string, userId: string) {
    const existingKnowledge = await this.prisma.domainKnowledge.findUnique({
      where: { id },
      select: { projectId: true, domain: true },
    });

    if (!existingKnowledge) {
      throw new NotFoundException('领域知识不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.DOCUMENTATION_DELETE,
      existingKnowledge.projectId,
    );

    // 软删除
    await this.prisma.domainKnowledge.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    // 记录审计日志
    await this.permissionService.logAction(
      userId,
      'DOMAIN_KNOWLEDGE_DELETE',
      'DOMAIN_KNOWLEDGE',
      id,
      { domain: existingKnowledge.domain },
    );

    return { message: '领域知识删除成功' };
  }

  // 概念管理
  async createConcept(
    domainKnowledgeId: string,
    createConceptDto: CreateDomainConceptDto,
    userId: string,
  ) {
    const domainKnowledge = await this.prisma.domainKnowledge.findUnique({
      where: { id: domainKnowledgeId },
      select: { projectId: true },
    });

    if (!domainKnowledge) {
      throw new NotFoundException('领域知识不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.DOCUMENTATION_UPDATE,
      domainKnowledge.projectId,
    );

    const concept = await this.prisma.domainConcept.create({
      data: {
        ...createConceptDto,
        domainKnowledgeId,
      },
    });

    return concept;
  }

  // 模式管理
  async createPattern(
    domainKnowledgeId: string,
    createPatternDto: CreateDomainPatternDto,
    userId: string,
  ) {
    const domainKnowledge = await this.prisma.domainKnowledge.findUnique({
      where: { id: domainKnowledgeId },
      select: { projectId: true },
    });

    if (!domainKnowledge) {
      throw new NotFoundException('领域知识不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.DOCUMENTATION_UPDATE,
      domainKnowledge.projectId,
    );

    const pattern = await this.prisma.domainPattern.create({
      data: {
        ...createPatternDto,
        domainKnowledgeId,
      },
    });

    return pattern;
  }

  // 最佳实践管理
  async createBestPractice(
    domainKnowledgeId: string,
    createBestPracticeDto: CreateDomainBestPracticeDto,
    userId: string,
  ) {
    const domainKnowledge = await this.prisma.domainKnowledge.findUnique({
      where: { id: domainKnowledgeId },
      select: { projectId: true },
    });

    if (!domainKnowledge) {
      throw new NotFoundException('领域知识不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.DOCUMENTATION_UPDATE,
      domainKnowledge.projectId,
    );

    const bestPractice = await this.prisma.domainBestPractice.create({
      data: {
        ...createBestPracticeDto,
        domainKnowledgeId,
      },
    });

    return bestPractice;
  }

  // 反模式管理
  async createAntiPattern(domainKnowledgeId: string, createAntiPatternDto: any, userId: string) {
    const domainKnowledge = await this.prisma.domainKnowledge.findUnique({
      where: { id: domainKnowledgeId },
      select: { projectId: true },
    });

    if (!domainKnowledge) {
      throw new NotFoundException('领域知识不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.DOCUMENTATION_UPDATE,
      domainKnowledge.projectId,
    );

    const antiPattern = await this.prisma.domainAntiPattern.create({
      data: {
        ...createAntiPatternDto,
        domainKnowledgeId,
      },
    });

    return antiPattern;
  }

  // 参考资料管理
  async createReference(domainKnowledgeId: string, createReferenceDto: any, userId: string) {
    const domainKnowledge = await this.prisma.domainKnowledge.findUnique({
      where: { id: domainKnowledgeId },
      select: { projectId: true },
    });

    if (!domainKnowledge) {
      throw new NotFoundException('领域知识不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.DOCUMENTATION_UPDATE,
      domainKnowledge.projectId,
    );

    const reference = await this.prisma.domainReference.create({
      data: {
        ...createReferenceDto,
        domainKnowledgeId,
      },
    });

    return reference;
  }
}
