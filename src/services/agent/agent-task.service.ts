import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// 请求验证schema
const createAgentTaskSchema = z.object({
  agentId: z.string().min(1, '代理ID不能为空'),
  taskId: z.string().min(1, '任务ID不能为空'),
});

const queryAgentTaskSchema = z.object({
  agentId: z.string().optional(),
  taskId: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

export class AgentTaskService {
  /**
   * 获取代理任务列表
   */
  static async getAgentTasks(query: z.infer<typeof queryAgentTaskSchema>) {
    try {
      const validatedQuery = queryAgentTaskSchema.parse(query);
      
      const where: any = {};
      if (validatedQuery.agentId) where.agentId = validatedQuery.agentId;
      if (validatedQuery.taskId) where.taskId = validatedQuery.taskId;

      const [tasks, total] = await Promise.all([
        prisma.agentTask.findMany({
          where,
          include: {
            agent: {
              include: {
                team: true,
                project: true,
              },
            },
            task: {
              include: {
                project: true,
                team: true,
                sprint: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: validatedQuery.limit,
          skip: validatedQuery.offset,
        }),
        prisma.agentTask.count({ where }),
      ]);

      return {
        success: true,
        data: {
          tasks,
          total,
          limit: validatedQuery.limit,
          offset: validatedQuery.offset,
        },
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('请求参数错误');
      }
      throw new Error('获取代理任务列表失败');
    }
  }

  /**
   * 根据ID获取代理任务
   */
  static async getAgentTaskById(id: string) {
    try {
      const agentTask = await prisma.agentTask.findUnique({
        where: { id },
        include: {
          agent: {
            include: {
              team: true,
              project: true,
            },
          },
          task: {
            include: {
              project: true,
              team: true,
              sprint: true,
            },
          },
        },
      });

      if (!agentTask) {
        throw new Error('代理任务不存在');
      }

      return {
        success: true,
        data: agentTask,
      };
    } catch {
      throw new Error('获取代理任务详情失败');
    }
  }

  /**
   * 创建代理任务
   */
  static async createAgentTask(data: z.infer<typeof createAgentTaskSchema>) {
    try {
      const validatedData = createAgentTaskSchema.parse(data);

      // 检查代理是否存在
      const agent = await prisma.agent.findUnique({
        where: { id: validatedData.agentId },
      });

      if (!agent) {
        throw new Error('代理不存在');
      }

      // 检查任务是否存在
      const task = await prisma.task.findUnique({
        where: { id: validatedData.taskId },
      });

      if (!task) {
        throw new Error('任务不存在');
      }

      // 检查任务是否已分配给该代理
      const existingAssignment = await prisma.agentTask.findFirst({
        where: {
          agentId: validatedData.agentId,
          taskId: validatedData.taskId,
        },
      });

      if (existingAssignment) {
        throw new Error('任务已分配给该代理');
      }

      const agentTask = await prisma.agentTask.create({
        data: {
          agentId: validatedData.agentId,
          taskId: validatedData.taskId,
        },
        include: {
          agent: true,
          task: true,
        },
      });

      // 创建活动记录
      await prisma.agentActivity.create({
        data: {
          agentId: validatedData.agentId,
          body: `任务 "${task.title}" 已分配给代理 ${agent.name}`,
          action: 'agent_work',
          details: {
            taskId: task.id,
            taskTitle: task.title,
          },
        },
      });

      return {
        success: true,
        data: agentTask,
        message: '代理任务创建成功',
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('请求参数错误');
      }
      throw error;
    }
  }

  /**
   * 删除代理任务
   */
  static async deleteAgentTask(id: string) {
    try {
      await prisma.agentTask.delete({
        where: { id },
      });

      return {
        success: true,
        message: '代理任务删除成功',
      };
    } catch {
      throw new Error('删除代理任务失败');
    }
  }

  /**
   * 批量分配任务给代理
   */
  static async batchAssignTasks(data: {
    agentId: string;
    taskIds: string[];
  }) {
    try {
      // 检查代理是否存在
      const agent = await prisma.agent.findUnique({
        where: { id: data.agentId },
      });

      if (!agent) {
        throw new Error('代理不存在');
      }

      // 过滤出未分配的任务
      const existingAssignments = await prisma.agentTask.findMany({
        where: {
          agentId: data.agentId,
          taskId: { in: data.taskIds },
        },
        select: { taskId: true },
      });

      const assignedTaskIds = new Set(existingAssignments.map(a => a.taskId));
      const newTaskIds = data.taskIds.filter(id => !assignedTaskIds.has(id));

      if (newTaskIds.length === 0) {
        throw new Error('所有任务都已分配给该代理');
      }

      // 批量创建任务分配
      const result = await prisma.agentTask.createMany({
        data: newTaskIds.map(taskId => ({
          agentId: data.agentId,
          taskId,
        })),
      });

      return {
        success: true,
        data: {
          created: result.count,
          skipped: data.taskIds.length - newTaskIds.length,
        },
        message: `成功分配 ${result.count} 个任务`,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * 获取代理的任务统计
   */
  static async getAgentTaskStats(agentId: string) {
    try {
      const [total, taskDetails] = await Promise.all([
        prisma.agentTask.count({ where: { agentId } }),
        prisma.agentTask.findMany({
          where: { agentId },
          include: {
            task: {
              select: {
                status: true,
                dueDate: true,
              },
            },
          },
        }),
      ]);

      // 根据任务状态统计
      const statusCounts = taskDetails.reduce((acc, item) => {
        const status = item.task.status;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // 统计过期任务
      const now = new Date();
      const overdue = taskDetails.filter(item => {
        const dueDate = item.task.dueDate;
        const status = item.task.status;
        return dueDate && dueDate < now && status !== 'done';
      }).length;

      return {
        success: true,
        data: {
          total,
          byStatus: statusCounts,
          overdue,
          completionRate: total > 0 ? Math.round(((statusCounts.done || 0) / total) * 100) : 0,
        },
      };
    } catch {
      throw new Error('获取代理任务统计失败');
    }
  }

  /**
   * 获取任务的代理分配历史
   */
  static async getTaskAssignmentHistory(taskId: string) {
    try {
      const assignments = await prisma.agentTask.findMany({
        where: { taskId },
        include: {
          agent: {
            select: {
              id: true,
              name: true,
              team: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return {
        success: true,
        data: assignments,
      };
    } catch {
      throw new Error('获取任务分配历史失败');
    }
  }

  /**
   * 获取代理的所有任务ID列表
   */
  static async getAgentTaskIds(agentId: string) {
    try {
      const agentTasks = await prisma.agentTask.findMany({
        where: { agentId },
        select: { taskId: true },
      });

      return {
        success: true,
        data: agentTasks.map(at => at.taskId),
      };
    } catch {
      throw new Error('获取代理任务ID列表失败');
    }
  }

  /**
   * 移除代理的任务分配
   */
  static async removeAgentTask(agentId: string, taskId: string) {
    try {
      const agentTask = await prisma.agentTask.findFirst({
        where: {
          agentId,
          taskId,
        },
      });

      if (!agentTask) {
        throw new Error('任务分配不存在');
      }

      await prisma.agentTask.delete({
        where: { id: agentTask.id },
      });

      // 记录活动
      const [agent, task] = await Promise.all([
        prisma.agent.findUnique({
          where: { id: agentId },
          select: { name: true },
        }),
        prisma.task.findUnique({
          where: { id: taskId },
          select: { title: true },
        }),
      ]);

      if (agent && task) {
        await prisma.agentActivity.create({
          data: {
            agentId,
            body: `任务 "${task.title}" 已从代理 ${agent.name} 移除`,
            action: 'agent_work',
            details: {
              taskId,
              taskTitle: task.title,
              action: 'remove_assignment',
            },
          },
        });
      }

      return {
        success: true,
        message: '任务分配已移除',
      };
    } catch (error) {
      throw error;
    }
  }
}