import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@shared/prisma/prisma.service';
import { CreateSprintDto, SprintStatus } from './dto/create-sprint.dto';
import { UpdateSprintDto } from './dto/update-sprint.dto';
import { PermissionService, Permission } from '../auth/permission.service';

@Injectable()
export class SprintService {
  constructor(
    private prisma: PrismaService,
    private permissionService: PermissionService,
  ) { }

  async create(createSprintDto: CreateSprintDto, userId: string) {
    const { projectId, ...sprintData } = createSprintDto;

    // 检查用户权限
    await this.permissionService.requirePermission(userId, Permission.TASK_CREATE, projectId);

    const sprint = await this.prisma.sprint.create({
      data: {
        name: sprintData.name,
        startDate: sprintData.startDate,
        endDate: sprintData.endDate,
        goal: sprintData.goal || '',
        status: sprintData.status || SprintStatus.TODO,
        project: { connect: { id: projectId } },
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // 记录审计日志
    await this.permissionService.logAction(userId, 'SPRINT_CREATE', 'SPRINT', sprint.id, {
      sprintName: sprint.name,
      projectId,
    });

    return sprint;
  }

  async findAll(userId: string, projectId?: string) {
    if (projectId) {
      // 检查用户权限
      await this.permissionService.requirePermission(userId, Permission.TASK_READ, projectId);
    }

    const sprints = await this.prisma.sprint.findMany({
      where: projectId
        ? { projectId }
        : {
          project: {
            members: {
              some: {
                userId,
              },
            },
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
            Task: true,
          },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    return sprints;
  }

  async findOne(id: string, userId: string) {
    const sprint = await this.prisma.sprint.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        Task: {
          take: 20,
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            Task: true,
          },
        },
      },
    });

    if (!sprint) {
      throw new NotFoundException('Sprint不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(userId, Permission.TASK_READ, sprint.projectId);

    return sprint;
  }

  async update(id: string, updateSprintDto: UpdateSprintDto, userId: string) {
    const existingSprint = await this.prisma.sprint.findUnique({
      where: { id },
      select: { projectId: true },
    });

    if (!existingSprint) {
      throw new NotFoundException('Sprint不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.TASK_UPDATE,
      existingSprint.projectId,
    );

    const sprint = await this.prisma.sprint.update({
      where: { id },
      data: updateSprintDto,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // 记录审计日志
    await this.permissionService.logAction(userId, 'SPRINT_UPDATE', 'SPRINT', id, {
      changes: updateSprintDto,
    });

    return sprint;
  }

  async remove(id: string, userId: string) {
    const existingSprint = await this.prisma.sprint.findUnique({
      where: { id },
      select: { projectId: true, name: true },
    });

    if (!existingSprint) {
      throw new NotFoundException('Sprint不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.TASK_DELETE,
      existingSprint.projectId,
    );

    await this.prisma.sprint.delete({
      where: { id },
    });

    // 记录审计日志
    await this.permissionService.logAction(userId, 'SPRINT_DELETE', 'SPRINT', id, {
      sprintName: existingSprint.name,
    });

    return { message: 'Sprint删除成功' };
  }

  async getActiveSprint(projectId: string, userId: string) {
    // 检查用户权限
    await this.permissionService.requirePermission(userId, Permission.TASK_READ, projectId);

    const now = new Date();
    const activeSprint = await this.prisma.sprint.findFirst({
      where: {
        projectId,
        status: SprintStatus.IN_PROGRESS,
        startDate: {
          lte: now,
        },
        endDate: {
          gte: now,
        },
      },
      include: {
        Task: true,
        _count: {
          select: {
            Task: true,
          },
        },
      },
    });

    return activeSprint;
  }

  async getStats(userId: string, projectId?: string) {
    const whereClause = projectId
      ? { projectId }
      : {
        project: {
          members: {
            some: {
              userId,
            },
          },
        },
      };

    const [total, todoCount, inProgressCount, doneCount] = await Promise.all([
      this.prisma.sprint.count({ where: whereClause }),
      this.prisma.sprint.count({
        where: { ...whereClause, status: SprintStatus.TODO },
      }),
      this.prisma.sprint.count({
        where: { ...whereClause, status: SprintStatus.IN_PROGRESS },
      }),
      this.prisma.sprint.count({
        where: { ...whereClause, status: SprintStatus.DONE },
      }),
    ]);

    return {
      total,
      todo: todoCount,
      inProgress: inProgressCount,
      done: doneCount,
    };
  }
}
