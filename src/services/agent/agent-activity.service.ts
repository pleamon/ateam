import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// 请求验证schema
const createAgentActivitySchema = z.object({
  agentId: z.string().min(1, '代理ID不能为空'),
  body: z.string().min(1, '活动内容不能为空'),
  action: z.enum(['agent_checkin', 'agent_checkout', 'agent_work', 'agent_submit_work']).default('agent_checkin'),
  details: z.any().optional(),
});

const queryAgentActivitySchema = z.object({
  agentId: z.string().optional(),
  action: z.enum(['agent_checkin', 'agent_checkout', 'agent_work', 'agent_submit_work']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

export class AgentActivityService {
  /**
   * 获取代理活动列表
   */
  static async getAgentActivities(query: z.infer<typeof queryAgentActivitySchema>) {
    try {
      const validatedQuery = queryAgentActivitySchema.parse(query);
      
      const where: any = {};
      if (validatedQuery.agentId) where.agentId = validatedQuery.agentId;
      if (validatedQuery.action) where.action = validatedQuery.action;
      
      if (validatedQuery.startDate || validatedQuery.endDate) {
        where.createdAt = {};
        if (validatedQuery.startDate) {
          where.createdAt.gte = new Date(validatedQuery.startDate);
        }
        if (validatedQuery.endDate) {
          where.createdAt.lte = new Date(validatedQuery.endDate);
        }
      }

      const [activities, total] = await Promise.all([
        prisma.agentActivity.findMany({
          where,
          include: {
            agent: {
              include: {
                team: true,
                project: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: validatedQuery.limit,
          skip: validatedQuery.offset,
        }),
        prisma.agentActivity.count({ where }),
      ]);

      return {
        success: true,
        data: {
          activities,
          total,
          limit: validatedQuery.limit,
          offset: validatedQuery.offset,
        },
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('请求参数错误');
      }
      throw new Error('获取代理活动列表失败');
    }
  }

  /**
   * 根据ID获取代理活动
   */
  static async getAgentActivityById(id: string) {
    try {
      const activity = await prisma.agentActivity.findUnique({
        where: { id },
        include: {
          agent: {
            include: {
              team: true,
              project: true,
            },
          },
        },
      });

      if (!activity) {
        throw new Error('代理活动不存在');
      }

      return {
        success: true,
        data: activity,
      };
    } catch {
      throw new Error('获取代理活动详情失败');
    }
  }

  /**
   * 创建代理活动
   */
  static async createAgentActivity(data: z.infer<typeof createAgentActivitySchema>) {
    try {
      const validatedData = createAgentActivitySchema.parse(data);

      // 检查代理是否存在
      const agent = await prisma.agent.findUnique({
        where: { id: validatedData.agentId },
      });

      if (!agent) {
        throw new Error('代理不存在');
      }

      const activity = await prisma.agentActivity.create({
        data: {
          agentId: validatedData.agentId,
          body: validatedData.body,
          action: validatedData.action,
          details: validatedData.details,
        },
        include: {
          agent: true,
        },
      });

      return {
        success: true,
        data: activity,
        message: '代理活动创建成功',
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('请求参数错误');
      }
      throw error;
    }
  }

  /**
   * 删除代理活动
   */
  static async deleteAgentActivity(id: string) {
    try {
      await prisma.agentActivity.delete({
        where: { id },
      });

      return {
        success: true,
        message: '代理活动删除成功',
      };
    } catch {
      throw new Error('删除代理活动失败');
    }
  }

  /**
   * 批量创建代理活动
   */
  static async batchCreateActivities(activities: Array<z.infer<typeof createAgentActivitySchema>>) {
    try {
      // 验证所有活动数据
      const validatedActivities = activities.map(activity => 
        createAgentActivitySchema.parse(activity)
      );

      // 获取所有唯一的代理ID
      const agentIds = [...new Set(validatedActivities.map(a => a.agentId))];

      // 检查所有代理是否存在
      const existingAgents = await prisma.agent.findMany({
        where: {
          id: { in: agentIds },
        },
        select: { id: true },
      });

      const existingAgentIds = new Set(existingAgents.map(a => a.id));
      const missingAgentIds = agentIds.filter(id => !existingAgentIds.has(id));

      if (missingAgentIds.length > 0) {
        throw new Error(`以下代理不存在: ${missingAgentIds.join(', ')}`);
      }

      // 批量创建活动
      const result = await prisma.agentActivity.createMany({
        data: validatedActivities,
      });

      return {
        success: true,
        data: {
          created: result.count,
        },
        message: `成功创建 ${result.count} 个活动记录`,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('请求参数错误');
      }
      throw error;
    }
  }

  /**
   * 获取代理的活动统计
   */
  static async getAgentActivityStats(agentId: string) {
    try {
      const [
        total,
        byAction,
        todayCount,
        weekCount,
      ] = await Promise.all([
        prisma.agentActivity.count({ where: { agentId } }),
        prisma.agentActivity.groupBy({
          by: ['action'],
          where: { agentId },
          _count: true,
        }),
        prisma.agentActivity.count({
          where: {
            agentId,
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        }),
        prisma.agentActivity.count({
          where: {
            agentId,
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        }),
      ]);

      return {
        success: true,
        data: {
          total,
          byAction: byAction.reduce((acc, item) => {
            acc[item.action] = item._count;
            return acc;
          }, {} as Record<string, number>),
          todayCount,
          weekCount,
        },
      };
    } catch {
      throw new Error('获取代理活动统计失败');
    }
  }

  /**
   * 获取最近的活动
   */
  static async getRecentActivities(limit: number = 10) {
    try {
      const activities = await prisma.agentActivity.findMany({
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
        take: limit,
      });

      return {
        success: true,
        data: activities,
      };
    } catch {
      throw new Error('获取最近活动失败');
    }
  }

  /**
   * 获取代理的最后一次活动
   */
  static async getAgentLastActivity(agentId: string) {
    try {
      const activity = await prisma.agentActivity.findFirst({
        where: { agentId },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          agent: true,
        },
      });

      return {
        success: true,
        data: activity,
      };
    } catch {
      throw new Error('获取代理最后活动失败');
    }
  }

  /**
   * 清理过期的活动记录
   */
  static async cleanupOldActivities(daysToKeep: number = 30) {
    try {
      const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

      const result = await prisma.agentActivity.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
        },
      });

      return {
        success: true,
        data: {
          deleted: result.count,
        },
        message: `成功删除 ${result.count} 条过期活动记录`,
      };
    } catch {
      throw new Error('清理过期活动记录失败');
    }
  }
}