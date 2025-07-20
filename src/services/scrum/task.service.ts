import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// 请求验证schema
const createTaskSchema = z.object({
  projectId: z.string().min(1, '项目ID不能为空'),
  teamId: z.string().min(1, '团队ID不能为空'),
  title: z.string().min(1, '任务标题不能为空'),
  content: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'testing', 'done']).default('todo'),
  dueDate: z.string().datetime().optional(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1, '任务标题不能为空').optional(),
  content: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'testing', 'done']).optional(),
  dueDate: z.string().datetime().optional(),
});

export class TaskService {
  /**
   * 获取所有任务
   */
  static async getAllTasks(projectId?: string) {
    try {
      const tasks = await prisma.task.findMany({
        where: projectId ? { projectId } : undefined,
        include: {
          project: true,
          team: true,
          TeamMemberTask: {
            include: {
              teamMember: true,
            },
          },
          TeamMemberWorklog: true,
          TaskActivity: true,
        },
      });

      return {
        success: true,
        data: tasks,
      };
    } catch {
      throw new Error('获取任务列表失败');
    }
  }

  /**
   * 根据ID获取任务
   */
  static async getTaskById(id: string) {
    try {
      const task = await prisma.task.findUnique({
        where: { id },
        include: {
          project: true,
          team: true,
          TeamMemberTask: {
            include: {
              teamMember: true,
            },
          },
          TeamMemberWorklog: true,
          TaskActivity: true,
        },
      });

      if (!task) {
        throw new Error('任务不存在');
      }

      return {
        success: true,
        data: task,
      };
    } catch {
      throw new Error('获取任务详情失败');
    }
  }

  /**
   * 创建任务
   */
  static async createTask(data: z.infer<typeof createTaskSchema>) {
    try {
      const validatedData = createTaskSchema.parse(data);

      const task = await prisma.task.create({
        data: {
          projectId: validatedData.projectId,
          teamId: validatedData.teamId,
          title: validatedData.title,
          content: validatedData.content,
          status: validatedData.status,
          dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        },
      });

      return {
        success: true,
        data: task,
        message: '任务创建成功',
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('请求参数错误');
      }
      throw new Error('创建任务失败');
    }
  }

  /**
   * 更新任务
   */
  static async updateTask(id: string, data: z.infer<typeof updateTaskSchema>) {
    try {
      const validatedData = updateTaskSchema.parse(data);

      const task = await prisma.task.update({
        where: { id },
        data: {
          title: validatedData.title,
          content: validatedData.content,
          status: validatedData.status,
          dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
        },
      });

      return {
        success: true,
        data: task,
        message: '任务更新成功',
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('请求参数错误');
      }
      throw new Error('更新任务失败');
    }
  }

  /**
   * 删除任务
   */
  static async deleteTask(id: string) {
    try {
      await prisma.task.delete({
        where: { id },
      });

      return {
        success: true,
        message: '任务删除成功',
      };
    } catch {
      throw new Error('删除任务失败');
    }
  }

  /**
   * 分配任务给团队成员
   */
  static async assignTask(taskId: string, teamMemberId: string) {
    try {
      const teamMemberTask = await prisma.teamMemberTask.create({
        data: {
          teamMemberId,
          taskId,
          status: 'todo',
        },
        include: {
          teamMember: true,
          task: true,
        },
      });

      return {
        success: true,
        data: teamMemberTask,
        message: '任务分配成功',
      };
    } catch {
      throw new Error('分配任务失败');
    }
  }

  /**
   * 添加任务活动
   */
  static async addTaskActivity(taskId: string, body: string) {
    try {
      const activity = await prisma.taskActivity.create({
        data: {
          taskId,
          body,
        },
      });

      return {
        success: true,
        data: activity,
        message: '活动记录添加成功',
      };
    } catch {
      throw new Error('添加活动记录失败');
    }
  }

  /**
   * 获取项目任务
   */
  static async getProjectTasks(projectId: string) {
    try {
      const tasks = await prisma.task.findMany({
        where: { projectId },
        include: {
          team: true,
          TeamMemberTask: {
            include: {
              teamMember: true,
            },
          },
        },
      });

      return {
        success: true,
        data: tasks,
      };
    } catch {
      throw new Error('获取项目任务失败');
    }
  }

  /**
   * 获取任务统计信息
   */
  static async getTaskStats(projectId?: string) {
    try {
      const whereClause = projectId ? { projectId } : {};

      const [totalTasks, todoTasks, inProgressTasks, doneTasks] = await Promise.all([
        prisma.task.count({ where: whereClause }),
        prisma.task.count({ where: { ...whereClause, status: 'todo' } }),
        prisma.task.count({
          where: { ...whereClause, status: 'in_progress' },
        }),
        prisma.task.count({ where: { ...whereClause, status: 'done' } }),
      ]);

      return {
        success: true,
        data: {
          totalTasks,
          todoTasks,
          inProgressTasks,
          doneTasks,
        },
      };
    } catch {
      throw new Error('获取任务统计信息失败');
    }
  }

  /**
   * 更新任务状态
   */
  static async updateTaskStatus(id: string, status: string) {
    try {
      const task = await prisma.task.update({
        where: { id },
        data: { status },
      });

      return {
        success: true,
        data: task,
        message: '任务状态更新成功',
      };
    } catch {
      throw new Error('更新任务状态失败');
    }
  }
}
