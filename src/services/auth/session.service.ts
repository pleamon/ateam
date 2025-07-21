import { PrismaClient } from '../../../generated/prisma';
import { z } from 'zod';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

// 请求验证schema
const createSessionSchema = z.object({
  userId: z.string().min(1, '用户ID不能为空'),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  expiresIn: z.number().min(1).default(86400), // 默认24小时
});

const updateSessionSchema = z.object({
  expiresAt: z.string().datetime().optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

export class SessionService {
  /**
   * 生成会话令牌
   */
  private static generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * 获取所有会话
   */
  static async getAllSessions(userId?: string) {
    try {
      const sessions = await prisma.session.findMany({
        where: userId ? { userId } : undefined,
        include: {
          user: {
            select: {
              id: true,
              email: true,
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
        data: sessions,
      };
    } catch {
      throw new Error('获取会话列表失败');
    }
  }

  /**
   * 根据ID获取会话
   */
  static async getSessionById(id: string) {
    try {
      const session = await prisma.session.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true,
              name: true,
              avatar: true,
              role: true,
            },
          },
        },
      });

      if (!session) {
        throw new Error('会话不存在');
      }

      return {
        success: true,
        data: session,
      };
    } catch {
      throw new Error('获取会话详情失败');
    }
  }

  /**
   * 根据令牌获取会话
   */
  static async getSessionByToken(token: string) {
    try {
      const session = await prisma.session.findUnique({
        where: { token },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true,
              name: true,
              avatar: true,
              role: true,
              isActive: true,
            },
          },
        },
      });

      if (!session) {
        throw new Error('会话不存在');
      }

      // 检查会话是否过期
      if (new Date() > session.expiresAt) {
        throw new Error('会话已过期');
      }

      // 检查用户是否被禁用
      if (!session.user.isActive) {
        throw new Error('用户已被禁用');
      }

      return {
        success: true,
        data: session,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * 创建会话
   */
  static async createSession(data: z.infer<typeof createSessionSchema>) {
    try {
      const validatedData = createSessionSchema.parse(data);

      // 计算过期时间
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + validatedData.expiresIn);

      const session = await prisma.session.create({
        data: {
          userId: validatedData.userId,
          token: this.generateToken(),
          ipAddress: validatedData.ipAddress,
          userAgent: validatedData.userAgent,
          expiresAt,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true,
              name: true,
              avatar: true,
              role: true,
            },
          },
        },
      });

      // 更新用户最后登录时间
      await prisma.user.update({
        where: { id: validatedData.userId },
        data: { lastLoginAt: new Date() },
      });

      return {
        success: true,
        data: session,
        message: '会话创建成功',
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('请求参数错误');
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('创建会话失败');
    }
  }

  /**
   * 更新会话
   */
  static async updateSession(id: string, data: z.infer<typeof updateSessionSchema>) {
    try {
      const validatedData = updateSessionSchema.parse(data);

      const session = await prisma.session.update({
        where: { id },
        data: {
          expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : undefined,
          ipAddress: validatedData.ipAddress,
          userAgent: validatedData.userAgent,
        },
      });

      return {
        success: true,
        data: session,
        message: '会话更新成功',
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('请求参数错误');
      }
      throw new Error('更新会话失败');
    }
  }

  /**
   * 延长会话
   */
  static async extendSession(id: string, extendBy = 86400) {
    try {
      const session = await prisma.session.findUnique({
        where: { id },
      });

      if (!session) {
        throw new Error('会话不存在');
      }

      const newExpiresAt = new Date(session.expiresAt);
      newExpiresAt.setSeconds(newExpiresAt.getSeconds() + extendBy);

      const updatedSession = await prisma.session.update({
        where: { id },
        data: { expiresAt: newExpiresAt },
      });

      return {
        success: true,
        data: updatedSession,
        message: '会话延长成功',
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('延长会话失败');
    }
  }

  /**
   * 删除会话
   */
  static async deleteSession(id: string) {
    try {
      await prisma.session.delete({
        where: { id },
      });

      return {
        success: true,
        message: '会话删除成功',
      };
    } catch {
      throw new Error('删除会话失败');
    }
  }

  /**
   * 根据令牌删除会话
   */
  static async deleteSessionByToken(token: string) {
    try {
      await prisma.session.delete({
        where: { token },
      });

      return {
        success: true,
        message: '会话删除成功',
      };
    } catch {
      throw new Error('删除会话失败');
    }
  }

  /**
   * 删除用户的所有会话
   */
  static async deleteUserSessions(userId: string) {
    try {
      const result = await prisma.session.deleteMany({
        where: { userId },
      });

      return {
        success: true,
        data: { count: result.count },
        message: `删除了 ${result.count} 个会话`,
      };
    } catch {
      throw new Error('删除用户会话失败');
    }
  }

  /**
   * 清理过期会话
   */
  static async cleanExpiredSessions() {
    try {
      const result = await prisma.session.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });

      return {
        success: true,
        data: { count: result.count },
        message: `清理了 ${result.count} 个过期会话`,
      };
    } catch {
      throw new Error('清理过期会话失败');
    }
  }

  /**
   * 获取活跃会话统计
   */
  static async getActiveSessionStats() {
    try {
      const now = new Date();
      const [totalSessions, activeSessions, expiredSessions] = await Promise.all([
        prisma.session.count(),
        prisma.session.count({
          where: {
            expiresAt: {
              gt: now,
            },
          },
        }),
        prisma.session.count({
          where: {
            expiresAt: {
              lte: now,
            },
          },
        }),
      ]);

      // 获取最近24小时内创建的会话数
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const recentSessions = await prisma.session.count({
        where: {
          createdAt: {
            gte: yesterday,
          },
        },
      });

      return {
        success: true,
        data: {
          totalSessions,
          activeSessions,
          expiredSessions,
          recentSessions,
        },
      };
    } catch {
      throw new Error('获取会话统计信息失败');
    }
  }

  /**
   * 验证会话有效性
   */
  static async validateSession(token: string) {
    try {
      const session = await this.getSessionByToken(token);
      
      // 自动延长活跃会话
      const now = new Date();
      const expiresAt = new Date(session.data.expiresAt);
      const timeLeft = expiresAt.getTime() - now.getTime();
      
      // 如果剩余时间少于1小时，自动延长24小时
      if (timeLeft < 3600000) {
        await this.extendSession(session.data.id);
      }

      return {
        success: true,
        data: {
          valid: true,
          session: session.data,
        },
      };
    } catch {
      return {
        success: false,
        data: {
          valid: false,
        },
      };
    }
  }
}