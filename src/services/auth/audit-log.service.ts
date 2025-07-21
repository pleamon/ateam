import { PrismaClient } from '../../../generated/prisma';
import { z } from 'zod';

const prisma = new PrismaClient();

// 请求验证schema
const createAuditLogSchema = z.object({
  userId: z.string().optional(),
  action: z.string().min(1, '操作类型不能为空'),
  resource: z.string().min(1, '资源类型不能为空'),
  resourceId: z.string().optional(),
  details: z.any().optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

const queryAuditLogSchema = z.object({
  userId: z.string().optional(),
  resource: z.string().optional(),
  action: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.number().min(1).max(1000).default(100),
  offset: z.number().min(0).default(0),
});

export class AuditLogService {
  /**
   * 获取审计日志列表
   */
  static async getAuditLogs(query: z.infer<typeof queryAuditLogSchema>) {
    try {
      const validatedQuery = queryAuditLogSchema.parse(query);
      
      const where: any = {};
      if (validatedQuery.userId) where.userId = validatedQuery.userId;
      if (validatedQuery.resource) where.resource = validatedQuery.resource;
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

      const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                username: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: validatedQuery.limit,
          skip: validatedQuery.offset,
        }),
        prisma.auditLog.count({ where }),
      ]);

      return {
        success: true,
        data: {
          logs,
          total,
          limit: validatedQuery.limit,
          offset: validatedQuery.offset,
        },
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('请求参数错误');
      }
      throw new Error('获取审计日志失败');
    }
  }

  /**
   * 创建审计日志
   */
  static async createAuditLog(data: z.infer<typeof createAuditLogSchema>) {
    try {
      const validatedData = createAuditLogSchema.parse(data);

      const log = await prisma.auditLog.create({
        data: {
          action: validatedData.action,
          resource: validatedData.resource,
          userId: validatedData.userId,
          resourceId: validatedData.resourceId,
          details: validatedData.details,
          ipAddress: validatedData.ipAddress,
          userAgent: validatedData.userAgent,
        },
      });

      return {
        success: true,
        data: log,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('请求参数错误');
      }
      throw new Error('创建审计日志失败');
    }
  }

  /**
   * 批量创建审计日志
   */
  static async createBatchAuditLogs(logs: z.infer<typeof createAuditLogSchema>[]) {
    try {
      const validatedLogs = logs.map(log => {
        const parsed = createAuditLogSchema.parse(log);
        return {
          action: parsed.action,
          resource: parsed.resource,
          userId: parsed.userId,
          resourceId: parsed.resourceId,
          details: parsed.details,
          ipAddress: parsed.ipAddress,
          userAgent: parsed.userAgent,
        };
      });

      const result = await prisma.auditLog.createMany({
        data: validatedLogs,
      });

      return {
        success: true,
        data: {
          count: result.count,
        },
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('请求参数错误');
      }
      throw new Error('批量创建审计日志失败');
    }
  }

  /**
   * 获取用户操作统计
   */
  static async getUserActionStats(userId: string, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const logs = await prisma.auditLog.findMany({
        where: {
          userId,
          createdAt: {
            gte: startDate,
          },
        },
        select: {
          action: true,
          resource: true,
        },
      });

      // 统计操作类型
      const actionStats: Record<string, number> = {};
      const resourceStats: Record<string, number> = {};

      logs.forEach(log => {
        actionStats[log.action] = (actionStats[log.action] || 0) + 1;
        resourceStats[log.resource] = (resourceStats[log.resource] || 0) + 1;
      });

      return {
        success: true,
        data: {
          totalActions: logs.length,
          actionStats,
          resourceStats,
          period: {
            start: startDate,
            end: new Date(),
            days,
          },
        },
      };
    } catch {
      throw new Error('获取用户操作统计失败');
    }
  }

  /**
   * 获取资源操作历史
   */
  static async getResourceHistory(resource: string, resourceId: string) {
    try {
      const logs = await prisma.auditLog.findMany({
        where: {
          resource,
          resourceId,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return {
        success: true,
        data: logs,
      };
    } catch {
      throw new Error('获取资源操作历史失败');
    }
  }

  /**
   * 清理过期日志
   */
  static async cleanOldLogs(daysToKeep = 90) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const result = await prisma.auditLog.deleteMany({
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
          cutoffDate,
        },
        message: `清理了 ${result.count} 条过期日志`,
      };
    } catch {
      throw new Error('清理过期日志失败');
    }
  }

  /**
   * 获取系统操作统计
   */
  static async getSystemStats(days = 7) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const logs = await prisma.auditLog.findMany({
        where: {
          createdAt: {
            gte: startDate,
          },
        },
      });

      // 按日期统计
      const dailyStats: Record<string, number> = {};
      const hourlyStats: Record<number, number> = {};

      logs.forEach(log => {
        const date = log.createdAt.toISOString().split('T')[0];
        const hour = log.createdAt.getHours();
        
        dailyStats[date] = (dailyStats[date] || 0) + 1;
        hourlyStats[hour] = (hourlyStats[hour] || 0) + 1;
      });

      // 获取最活跃用户
      const userActivity: Record<string, number> = {};
      logs.forEach(log => {
        if (log.userId) {
          userActivity[log.userId] = (userActivity[log.userId] || 0) + 1;
        }
      });

      const topUsers = Object.entries(userActivity)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([userId, count]) => ({ userId, count }));

      return {
        success: true,
        data: {
          total: logs.length,
          dailyStats,
          hourlyStats,
          topUsers,
          period: {
            start: startDate,
            end: new Date(),
            days,
          },
        },
      };
    } catch {
      throw new Error('获取系统统计失败');
    }
  }
}