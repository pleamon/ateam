import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@shared/prisma/prisma.service';
import {
  CreateRequirementDto,
  CreateRequirementQuestionDto,
  RequirementStatus,
  // QuestionStatus,
} from '../dto/create-requirement.dto';
import { PermissionService, Permission } from '../../auth/permission.service';

@Injectable()
export class RequirementService {
  constructor(
    private prisma: PrismaService,
    private permissionService: PermissionService,
  ) { }

  async create(createRequirementDto: CreateRequirementDto, userId: string) {
    const { projectId, ...requirementData } = createRequirementDto;

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.DOCUMENTATION_CREATE,
      projectId,
    );

    const requirement = await this.prisma.requirement.create({
      data: {
        ...requirementData,
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
            children: true,
            questions: true,
            attachments: true,
          },
        },
      },
    });

    // 记录审计日志
    await this.permissionService.logAction(
      userId,
      'REQUIREMENT_CREATE',
      'REQUIREMENT',
      requirement.id,
      { title: requirement.title, projectId },
    );

    return requirement;
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
      // 只查看用户有权限的项目需求
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
    if (filters?.priority) where.priority = filters.priority;
    if (filters?.status) where.status = filters.status;
    if (filters?.source) where.source = filters.source;

    // 只查询顶级需求
    if (!filters?.includeChildren) {
      where.parentId = null;
    }

    const requirements = await this.prisma.requirement.findMany({
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
            children: true,
            questions: true,
            attachments: true,
          },
        },
      },
      orderBy: [{ priority: 'asc' }, { updatedAt: 'desc' }],
    });

    return requirements;
  }

  async findOne(id: string, userId: string) {
    const requirement = await this.prisma.requirement.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        parent: {
          select: {
            id: true,
            title: true,
          },
        },
        children: {
          where: {
            deletedAt: null,
          },
          include: {
            _count: {
              select: {
                children: true,
                questions: true,
              },
            },
          },
        },
        questions: {
          include: {
            agent: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            priority: 'asc',
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
        _count: {
          select: {
            children: true,
            questions: true,
            attachments: true,
          },
        },
      },
    });

    if (!requirement || requirement.deletedAt) {
      throw new NotFoundException('需求不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.DOCUMENTATION_READ,
      requirement.projectId,
    );

    return requirement;
  }

  async update(id: string, updateData: any, userId: string) {
    const existingRequirement = await this.prisma.requirement.findUnique({
      where: { id },
      select: { projectId: true },
    });

    if (!existingRequirement) {
      throw new NotFoundException('需求不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.DOCUMENTATION_UPDATE,
      existingRequirement.projectId,
    );

    const requirement = await this.prisma.requirement.update({
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
            children: true,
            questions: true,
            attachments: true,
          },
        },
      },
    });

    // 记录审计日志
    await this.permissionService.logAction(userId, 'REQUIREMENT_UPDATE', 'REQUIREMENT', id, {
      changes: updateData,
    });

    return requirement;
  }

  async remove(id: string, userId: string) {
    const existingRequirement = await this.prisma.requirement.findUnique({
      where: { id },
      select: { projectId: true, title: true },
    });

    if (!existingRequirement) {
      throw new NotFoundException('需求不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.DOCUMENTATION_DELETE,
      existingRequirement.projectId,
    );

    // 软删除
    await this.prisma.requirement.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    // 记录审计日志
    await this.permissionService.logAction(userId, 'REQUIREMENT_DELETE', 'REQUIREMENT', id, {
      title: existingRequirement.title,
    });

    return { message: '需求删除成功' };
  }

  async updateStatus(id: string, status: RequirementStatus, userId: string) {
    const existingRequirement = await this.prisma.requirement.findUnique({
      where: { id },
      select: { projectId: true, status: true },
    });

    if (!existingRequirement) {
      throw new NotFoundException('需求不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.DOCUMENTATION_UPDATE,
      existingRequirement.projectId,
    );

    const requirement = await this.prisma.requirement.update({
      where: { id },
      data: { status },
    });

    // 记录审计日志
    await this.permissionService.logAction(userId, 'REQUIREMENT_STATUS_UPDATE', 'REQUIREMENT', id, {
      oldStatus: existingRequirement.status,
      newStatus: status,
    });

    return requirement;
  }

  // 需求问题管理
  async createQuestion(
    requirementId: string,
    createQuestionDto: CreateRequirementQuestionDto,
    userId: string,
  ) {
    const requirement = await this.prisma.requirement.findUnique({
      where: { id: requirementId },
      select: { projectId: true },
    });

    if (!requirement) {
      throw new NotFoundException('需求不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.DOCUMENTATION_UPDATE,
      requirement.projectId,
    );

    const { agentId, ...questionData } = createQuestionDto;
    const question = await this.prisma.requirementQuestion.create({
      data: {
        ...questionData,
        requirement: { connect: { id: requirementId } },
        project: { connect: { id: requirement.projectId } },
        agent: agentId ? { connect: { id: agentId } } : undefined,
      },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return question;
  }

  async updateQuestion(questionId: string, updateData: any, userId: string) {
    const question = await this.prisma.requirementQuestion.findUnique({
      where: { id: questionId },
      include: {
        requirement: {
          select: {
            projectId: true,
          },
        },
      },
    });

    if (!question) {
      throw new NotFoundException('问题不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.DOCUMENTATION_UPDATE,
      question.requirement.projectId,
    );

    const updatedQuestion = await this.prisma.requirementQuestion.update({
      where: { id: questionId },
      data: {
        ...updateData,
        answeredAt: updateData.answer ? new Date() : undefined,
      },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return updatedQuestion;
  }

  async removeQuestion(questionId: string, userId: string) {
    const question = await this.prisma.requirementQuestion.findUnique({
      where: { id: questionId },
      include: {
        requirement: {
          select: {
            projectId: true,
          },
        },
      },
    });

    if (!question) {
      throw new NotFoundException('问题不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.DOCUMENTATION_UPDATE,
      question.requirement.projectId,
    );

    await this.prisma.requirementQuestion.delete({
      where: { id: questionId },
    });

    return { message: '问题删除成功' };
  }
}
