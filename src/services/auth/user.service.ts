import { PrismaClient, UserRole } from '../../../generated/prisma';
import { z } from 'zod';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// 请求验证schema
const createUserSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  username: z.string().min(3, '用户名至少3个字符').max(50),
  password: z.string().min(6, '密码至少6个字符'),
  name: z.string().optional(),
  avatar: z.string().url('头像URL格式不正确').optional(),
  role: z.nativeEnum(UserRole).optional(),
});

const updateUserSchema = z.object({
  email: z.string().email('邮箱格式不正确').optional(),
  username: z.string().min(3, '用户名至少3个字符').max(50).optional(),
  password: z.string().min(6, '密码至少6个字符').optional(),
  name: z.string().optional(),
  avatar: z.string().url('头像URL格式不正确').optional(),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.boolean().optional(),
});

const changePasswordSchema = z.object({
  oldPassword: z.string().min(6, '密码至少6个字符'),
  newPassword: z.string().min(6, '密码至少6个字符'),
});

export class UserService {
  /**
   * 获取所有用户
   */
  static async getAllUsers(includeInactive = false) {
    try {
      const users = await prisma.user.findMany({
        where: includeInactive ? {} : { isActive: true },
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
          avatar: true,
          role: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          projectMembers: {
            include: {
              project: true,
            },
          },
        },
      });

      return {
        success: true,
        data: users,
      };
    } catch {
      throw new Error('获取用户列表失败');
    }
  }

  /**
   * 根据ID获取用户
   */
  static async getUserById(id: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
          avatar: true,
          role: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          projects: true,
          projectMembers: {
            include: {
              project: true,
            },
          },
        },
      });

      if (!user) {
        throw new Error('用户不存在');
      }

      return {
        success: true,
        data: user,
      };
    } catch {
      throw new Error('获取用户详情失败');
    }
  }

  /**
   * 根据邮箱获取用户
   */
  static async getUserByEmail(email: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
          avatar: true,
          role: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw new Error('用户不存在');
      }

      return {
        success: true,
        data: user,
      };
    } catch {
      throw new Error('获取用户失败');
    }
  }

  /**
   * 根据用户名获取用户
   */
  static async getUserByUsername(username: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { username },
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
          avatar: true,
          role: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw new Error('用户不存在');
      }

      return {
        success: true,
        data: user,
      };
    } catch {
      throw new Error('获取用户失败');
    }
  }

  /**
   * 创建用户
   */
  static async createUser(data: z.infer<typeof createUserSchema>) {
    try {
      const validatedData = createUserSchema.parse(data);

      // 检查邮箱是否已存在
      const existingEmail = await prisma.user.findUnique({
        where: { email: validatedData.email },
      });
      if (existingEmail) {
        throw new Error('邮箱已被注册');
      }

      // 检查用户名是否已存在
      const existingUsername = await prisma.user.findUnique({
        where: { username: validatedData.username },
      });
      if (existingUsername) {
        throw new Error('用户名已被占用');
      }

      // 加密密码
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);

      const user = await prisma.user.create({
        data: {
          email: validatedData.email,
          username: validatedData.username,
          password: hashedPassword,
          name: validatedData.name,
          avatar: validatedData.avatar,
          role: validatedData.role,
        },
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
          avatar: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      });

      return {
        success: true,
        data: user,
        message: '用户创建成功',
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('请求参数错误');
      }
      throw error;
    }
  }

  /**
   * 更新用户
   */
  static async updateUser(id: string, data: z.infer<typeof updateUserSchema>) {
    try {
      const validatedData = updateUserSchema.parse(data);

      // 如果要更新邮箱，检查是否已存在
      if (validatedData.email) {
        const existingEmail = await prisma.user.findFirst({
          where: {
            email: validatedData.email,
            NOT: { id },
          },
        });
        if (existingEmail) {
          throw new Error('邮箱已被其他用户使用');
        }
      }

      // 如果要更新用户名，检查是否已存在
      if (validatedData.username) {
        const existingUsername = await prisma.user.findFirst({
          where: {
            username: validatedData.username,
            NOT: { id },
          },
        });
        if (existingUsername) {
          throw new Error('用户名已被其他用户使用');
        }
      }

      // 如果要更新密码，进行加密
      if (validatedData.password) {
        validatedData.password = await bcrypt.hash(validatedData.password, 10);
      }

      const user = await prisma.user.update({
        where: { id },
        data: {
          email: validatedData.email,
          username: validatedData.username,
          password: validatedData.password,
          name: validatedData.name,
          avatar: validatedData.avatar,
          role: validatedData.role,
        },
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
          avatar: true,
          role: true,
          isActive: true,
          updatedAt: true,
        },
      });

      return {
        success: true,
        data: user,
        message: '用户更新成功',
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('请求参数错误');
      }
      throw error;
    }
  }

  /**
   * 删除用户（软删除）
   */
  static async deleteUser(id: string) {
    try {
      const user = await prisma.user.update({
        where: { id },
        data: { isActive: false },
      });

      return {
        success: true,
        data: user,
        message: '用户删除成功',
      };
    } catch {
      throw new Error('删除用户失败');
    }
  }

  /**
   * 修改密码
   */
  static async changePassword(userId: string, data: z.infer<typeof changePasswordSchema>) {
    try {
      const validatedData = changePasswordSchema.parse(data);

      // 获取用户当前密码
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { password: true },
      });

      if (!user) {
        throw new Error('用户不存在');
      }

      // 验证旧密码
      const isValidPassword = await bcrypt.compare(validatedData.oldPassword, user.password);
      if (!isValidPassword) {
        throw new Error('原密码错误');
      }

      // 更新密码
      const hashedPassword = await bcrypt.hash(validatedData.newPassword, 10);
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      return {
        success: true,
        message: '密码修改成功',
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('请求参数错误');
      }
      throw error;
    }
  }

  /**
   * 更新最后登录时间
   */
  static async updateLastLogin(userId: string) {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { lastLoginAt: new Date() },
      });

      return {
        success: true,
        message: '最后登录时间更新成功',
      };
    } catch {
      throw new Error('更新最后登录时间失败');
    }
  }

  /**
   * 获取用户的项目列表
   */
  static async getUserProjects(userId: string) {
    try {
      const projectMembers = await prisma.projectMember.findMany({
        where: { userId },
        include: {
          project: true,
        },
      });

      const projects = projectMembers.map((pm) => ({
        ...pm.project,
        role: pm.role,
        permissions: pm.permissions,
        joinedAt: pm.joinedAt,
      }));

      return {
        success: true,
        data: projects,
      };
    } catch {
      throw new Error('获取用户项目列表失败');
    }
  }

  /**
   * 获取用户统计信息
   */
  static async getUserStats(userId: string) {
    try {
      const [projectsCreated, projectsJoined, totalSessions, totalAuditLogs] = await Promise.all([
        prisma.project.count({ where: { createdBy: userId } }),
        prisma.projectMember.count({ where: { userId } }),
        prisma.session.count({ where: { userId } }),
        prisma.auditLog.count({ where: { userId } }),
      ]);

      return {
        success: true,
        data: {
          projectsCreated,
          projectsJoined,
          totalSessions,
          totalAuditLogs,
        },
      };
    } catch {
      throw new Error('获取用户统计信息失败');
    }
  }

  /**
   * 验证用户密码（用于登录）
   */
  static async validateUserPassword(email: string, password: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user || !user.isActive) {
        throw new Error('用户不存在或已被禁用');
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new Error('密码错误');
      }

      return {
        success: true,
        data: {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name,
          avatar: user.avatar,
          role: user.role,
        },
      };
    } catch (error) {
      throw error;
    }
  }
}