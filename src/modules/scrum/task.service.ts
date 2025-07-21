import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@shared/prisma/prisma.service';
import { CreateTaskDto, TaskStatus } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AssignTaskDto } from './dto/assign-task.dto';
import { PermissionService, Permission } from '../auth/permission.service';

@Injectable()
export class TaskService {
  constructor(
    private prisma: PrismaService,
    private permissionService: PermissionService,
  ) { }

  async create(createTaskDto: CreateTaskDto, userId: string) {
    const { projectId, ...taskData } = createTaskDto;

    // 检查用户权限
    await this.permissionService.requirePermission(userId, Permission.TASK_CREATE, projectId);

    const task = await this.prisma.task.create({
      data: {
        title: taskData.title,
        content: taskData.content,
        status: taskData.status || TaskStatus.TODO,
        dueDate: taskData.dueDate,
        project: { connect: { id: projectId } },
        team: taskData.teamId ? { connect: { id: taskData.teamId } } : undefined,
        sprint: taskData.sprintId ? { connect: { id: taskData.sprintId } } : undefined,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        sprint: {
          select: {
            id: true,
            name: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // 记录审计日志
    await this.permissionService.logAction(userId, 'TASK_CREATE', 'TASK', task.id, {
      taskTitle: task.title,
      projectId,
    });

    return task;
  }

  async findAll(userId: string, projectId?: string) {
    if (projectId) {
      // 检查用户权限
      await this.permissionService.requirePermission(userId, Permission.TASK_READ, projectId);
    }

    const tasks = await this.prisma.task.findMany({
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
        sprint: {
          select: {
            id: true,
            name: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            AgentTask: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return tasks;
  }

  async findOne(id: string, userId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        sprint: {
          select: {
            id: true,
            name: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
        AgentTask: {
          include: {
            agent: true,
          },
        },
        // taskActivities 字段已移除，因为 Task 模型中不存在此关联
        // 如果需要活动日志，请使用 AgentWorklog 关联
        _count: {
          select: {
            AgentTask: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('任务不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(userId, Permission.TASK_READ, task.projectId);

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string) {
    const existingTask = await this.prisma.task.findUnique({
      where: { id },
      select: { projectId: true },
    });

    if (!existingTask) {
      throw new NotFoundException('任务不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.TASK_UPDATE,
      existingTask.projectId,
    );

    const task = await this.prisma.task.update({
      where: { id },
      data: updateTaskDto,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        sprint: {
          select: {
            id: true,
            name: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // 记录审计日志
    await this.permissionService.logAction(userId, 'TASK_UPDATE', 'TASK', id, {
      changes: updateTaskDto,
    });

    return task;
  }

  async remove(id: string, userId: string) {
    const existingTask = await this.prisma.task.findUnique({
      where: { id },
      select: { projectId: true, title: true },
    });

    if (!existingTask) {
      throw new NotFoundException('任务不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.TASK_DELETE,
      existingTask.projectId,
    );

    await this.prisma.task.delete({
      where: { id },
    });

    // 记录审计日志
    await this.permissionService.logAction(userId, 'TASK_DELETE', 'TASK', id, {
      taskTitle: existingTask.title,
    });

    return { message: '任务删除成功' };
  }

  async assignTask(taskId: string, assignTaskDto: AssignTaskDto, userId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { projectId: true, title: true },
    });

    if (!task) {
      throw new NotFoundException('任务不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(userId, Permission.TASK_ASSIGN, task.projectId);

    // 检查是否已经分配
    const existingAssignment = await this.prisma.agentTask.findFirst({
      where: {
        taskId,
        agentId: assignTaskDto.agentId,
      },
    });

    if (existingAssignment) {
      return { message: '任务已分配给该Agent' };
    }

    // 创建分配关系
    await this.prisma.agentTask.create({
      data: {
        taskId,
        agentId: assignTaskDto.agentId,
      },
    });

    // 记录活动 - 使用 AgentActivity 来记录
    if (assignTaskDto.agentId) {
      await this.prisma.agentActivity.create({
        data: {
          agentId: assignTaskDto.agentId,
          body: `任务 "${task.title}" 已分配给Agent`,
          action: 'agent_work',
          details: {
            taskId,
            assignedBy: userId,
          },
        },
      });
    }

    // 记录审计日志
    await this.permissionService.logAction(userId, 'TASK_ASSIGN', 'TASK', taskId, {
      agentId: assignTaskDto.agentId,
    });

    return { message: '任务分配成功' };
  }

  async updateStatus(id: string, status: TaskStatus, userId: string) {
    const existingTask = await this.prisma.task.findUnique({
      where: { id },
      select: { projectId: true, status: true },
    });

    if (!existingTask) {
      throw new NotFoundException('任务不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.TASK_UPDATE,
      existingTask.projectId,
    );

    const task = await this.prisma.task.update({
      where: { id },
      data: { status },
    });

    // 记录审计日志 - 状态变更
    // 注意: 没有 taskActivity 模型，使用审计日志记录

    // 记录审计日志
    await this.permissionService.logAction(userId, 'TASK_STATUS_UPDATE', 'TASK', id, {
      oldStatus: existingTask.status,
      newStatus: status,
    });

    return task;
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

    const [total, todoCount, inProgressCount, testingCount, doneCount] = await Promise.all([
      this.prisma.task.count({ where: whereClause }),
      this.prisma.task.count({
        where: { ...whereClause, status: TaskStatus.TODO },
      }),
      this.prisma.task.count({
        where: { ...whereClause, status: TaskStatus.IN_PROGRESS },
      }),
      this.prisma.task.count({
        where: { ...whereClause, status: TaskStatus.TESTING },
      }),
      this.prisma.task.count({
        where: { ...whereClause, status: TaskStatus.DONE },
      }),
    ]);

    return {
      total,
      todo: todoCount,
      inProgress: inProgressCount,
      testing: testingCount,
      done: doneCount,
    };
  }
}
