import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// System Architecture 相关的 Schema
export const createSystemArchitectureSchema = z.object({
  projectId: z.string().min(1, '项目ID不能为空'),
  overview: z.string().min(1, '技术架构总览不能为空'),
  platforms: z.array(z.string()),
  components: z.array(z.string()),
  technologies: z.array(z.string()),
  diagrams: z.string().optional(),
  notes: z.string().optional(),
});

export const updateSystemArchitectureSchema = z.object({
  overview: z.string().optional(),
  platforms: z.array(z.string()).optional(),
  components: z.array(z.string()).optional(),
  technologies: z.array(z.string()).optional(),
  diagrams: z.string().optional(),
  notes: z.string().optional(),
});

export const createPlatformArchitectureSchema = z.object({
  systemArchitectureId: z.string().min(1, '系统架构ID不能为空'),
  platform: z.string().min(1, '平台名称不能为空'),
  frontend: z.string().optional(),
  backend: z.string().optional(),
  technologies: z.array(z.string()),
  components: z.array(z.string()),
  diagrams: z.string().optional(),
  notes: z.string().optional(),
});

export const updatePlatformArchitectureSchema = z.object({
  platform: z.string().optional(),
  frontend: z.string().optional(),
  backend: z.string().optional(),
  technologies: z.array(z.string()).optional(),
  components: z.array(z.string()).optional(),
  diagrams: z.string().optional(),
  notes: z.string().optional(),
});

export class ArchitectureService {
  /**
   * 创建系统架构
   */
  static async createSystemArchitecture(data: z.infer<typeof createSystemArchitectureSchema>) {
    try {
      const validatedData = createSystemArchitectureSchema.parse(data);

      const systemArchitecture = await prisma.systemArchitecture.create({
        data: {
          projectId: validatedData.projectId,
          overview: validatedData.overview,
          platforms: validatedData.platforms || [],
          components: validatedData.components || [],
          technologies: validatedData.technologies || [],
          diagrams: validatedData.diagrams,
          notes: validatedData.notes,
        },
      });

      return {
        success: true,
        data: systemArchitecture,
        message: '系统架构创建成功',
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('请求参数错误');
      }
      throw new Error('创建系统架构失败');
    }
  }

  /**
   * 获取项目系统架构
   */
  static async getProjectSystemArchitecture(projectId: string) {
    try {
      const systemArchitecture = await prisma.systemArchitecture.findFirst({
        where: { projectId },
        include: {
          project: true,
          platformArchitectures: true,
        },
      });

      return {
        success: true,
        data: systemArchitecture,
      };
    } catch {
      throw new Error('获取项目系统架构失败');
    }
  }

  /**
   * 更新系统架构
   */
  static async updateSystemArchitecture(
    id: string,
    data: z.infer<typeof updateSystemArchitectureSchema>,
  ) {
    try {
      const validatedData = updateSystemArchitectureSchema.parse(data);

      const systemArchitecture = await prisma.systemArchitecture.update({
        where: { id },
        data: {
          overview: validatedData.overview,
          platforms: validatedData.platforms,
          components: validatedData.components,
          technologies: validatedData.technologies,
          diagrams: validatedData.diagrams,
          notes: validatedData.notes,
        },
      });

      return {
        success: true,
        data: systemArchitecture,
        message: '系统架构更新成功',
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('请求参数错误');
      }
      throw new Error('更新系统架构失败');
    }
  }

  /**
   * 删除系统架构
   */
  static async deleteSystemArchitecture(id: string) {
    try {
      await prisma.systemArchitecture.delete({
        where: { id },
      });

      return {
        success: true,
        message: '系统架构删除成功',
      };
    } catch {
      throw new Error('删除系统架构失败');
    }
  }

  /**
   * 创建平台架构
   */
  static async createPlatformArchitecture(data: z.infer<typeof createPlatformArchitectureSchema>) {
    try {
      const validatedData = createPlatformArchitectureSchema.parse(data);

      const platformArchitecture = await prisma.platformArchitecture.create({
        data: {
          systemArchitectureId: validatedData.systemArchitectureId,
          platform: validatedData.platform,
          frontend: validatedData.frontend,
          backend: validatedData.backend,
          technologies: validatedData.technologies || [],
          components: validatedData.components || [],
          diagrams: validatedData.diagrams,
          notes: validatedData.notes,
        },
      });

      return {
        success: true,
        data: platformArchitecture,
        message: '平台架构创建成功',
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('请求参数错误');
      }
      throw new Error('创建平台架构失败');
    }
  }

  /**
   * 获取系统架构的平台架构列表
   */
  static async getSystemPlatformArchitectures(systemArchitectureId: string) {
    try {
      const platformArchitectures = await prisma.platformArchitecture.findMany({
        where: { systemArchitectureId },
        include: {
          systemArchitecture: true,
        },
      });

      return {
        success: true,
        data: platformArchitectures,
      };
    } catch {
      throw new Error('获取平台架构列表失败');
    }
  }

  /**
   * 更新平台架构
   */
  static async updatePlatformArchitecture(
    id: string,
    data: z.infer<typeof updatePlatformArchitectureSchema>,
  ) {
    try {
      const validatedData = updatePlatformArchitectureSchema.parse(data);

      const platformArchitecture = await prisma.platformArchitecture.update({
        where: { id },
        data: {
          platform: validatedData.platform,
          frontend: validatedData.frontend,
          backend: validatedData.backend,
          technologies: validatedData.technologies,
          components: validatedData.components,
          diagrams: validatedData.diagrams,
          notes: validatedData.notes,
        },
      });

      return {
        success: true,
        data: platformArchitecture,
        message: '平台架构更新成功',
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('请求参数错误');
      }
      throw new Error('更新平台架构失败');
    }
  }

  /**
   * 删除平台架构
   */
  static async deletePlatformArchitecture(id: string) {
    try {
      await prisma.platformArchitecture.delete({
        where: { id },
      });

      return {
        success: true,
        message: '平台架构删除成功',
      };
    } catch {
      throw new Error('删除平台架构失败');
    }
  }
}
