import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { FastifyRequest } from 'fastify';

const prisma = new PrismaClient();

// JWT 配置
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// 注册验证
const registerSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  username: z.string().min(3, '用户名至少3个字符').max(20, '用户名最多20个字符'),
  password: z.string().min(6, '密码至少6个字符'),
  name: z.string().optional(),
});

// 登录验证
const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export class AuthService {
  /**
   * 用户注册
   */
  static async register(data: z.infer<typeof registerSchema>) {
    try {
      const validatedData = registerSchema.parse(data);

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
        throw new Error('用户名已被使用');
      }

      // 加密密码
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);

      // 创建用户
      const user = await prisma.user.create({
        data: {
          email: validatedData.email,
          username: validatedData.username,
          password: hashedPassword,
          name: validatedData.name,
        },
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
          role: true,
          createdAt: true,
        },
      });

      // 生成 token
      const token = this.generateToken(user.id, user.username);

      return {
        success: true,
        data: {
          user,
          token,
        },
        message: '注册成功',
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(error.errors[0].message);
      }
      throw error;
    }
  }

  /**
   * 用户登录
   */
  static async login(data: z.infer<typeof loginSchema>) {
    try {
      const validatedData = loginSchema.parse(data);

      // 查找用户（支持用户名或邮箱登录）
      const user = await prisma.user.findFirst({
        where: {
          OR: [{ username: validatedData.username }, { email: validatedData.username }],
          isActive: true,
        },
      });

      if (!user) {
        throw new Error('用户名或密码错误');
      }

      // 验证密码
      const isPasswordValid = await bcrypt.compare(validatedData.password, user.password);
      if (!isPasswordValid) {
        throw new Error('用户名或密码错误');
      }

      // 更新最后登录时间
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      // 生成 token
      const token = this.generateToken(user.id, user.username);

      // 创建会话
      await prisma.session.create({
        data: {
          userId: user.id,
          token,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天后过期
        },
      });

      return {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            name: user.name,
            role: user.role,
          },
          token,
        },
        message: '登录成功',
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(error.errors[0].message);
      }
      throw error;
    }
  }

  /**
   * 退出登录
   */
  static async logout(token: string) {
    try {
      await prisma.session.delete({
        where: { token },
      });

      return {
        success: true,
        message: '退出成功',
      };
    } catch {
      // 即使 session 不存在也返回成功
      return {
        success: true,
        message: '退出成功',
      };
    }
  }

  /**
   * 获取当前用户信息
   */
  static async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        avatar: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new Error('用户不存在');
    }

    return {
      success: true,
      data: user,
    };
  }

  /**
   * 验证 token
   */
  static async verifyToken(token: string): Promise<string | null> {
    try {
      // 验证 JWT
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

      // 检查 session 是否存在且未过期
      const session = await prisma.session.findUnique({
        where: { token },
        include: { user: true },
      });

      if (!session || session.expiresAt < new Date()) {
        return null;
      }

      if (!session.user.isActive) {
        return null;
      }

      return decoded.userId;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  /**
   * 生成 JWT token
   */
  private static generateToken(userId: string, username: string): string {
    return jwt.sign(
      {
        userId,
        username,
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN,
        jwtid: userId,
      },
    );
  }

  /**
   * 从请求中获取 token
   */
  static getTokenFromRequest(request: FastifyRequest): string | null {
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return null;
  }
}
