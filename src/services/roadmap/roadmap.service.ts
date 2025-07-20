import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// 请求验证schema
const createRoadmapSchema = z.object({
  projectId: z.string().min(1, '项目ID不能为空'),
  name: z.string().min(1, '路线图名称不能为空'),
  description: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  status: z.enum(['planning', 'active', 'completed', 'cancelled']).default('planning'),
});

const updateRoadmapSchema = z.object({
  name: z.string().min(1, '路线图名称不能为空').optional(),
  description: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  status: z.enum(['planning', 'active', 'completed', 'cancelled']).optional(),
});

const createMilestoneSchema = z.object({
  roadmapId: z.string().min(1, '路线图ID不能为空'),
  name: z.string().min(1, '里程碑名称不能为空'),
  description: z.string().optional(),
  targetDate: z.string().datetime(),
  status: z.enum(['planned', 'in_progress', 'completed', 'delayed']).default('planned'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
});

const updateMilestoneSchema = z.object({
  name: z.string().min(1, '里程碑名称不能为空').optional(),
  description: z.string().optional(),
  targetDate: z.string().datetime().optional(),
  status: z.enum(['planned', 'in_progress', 'completed', 'delayed']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
});

const createVersionSchema = z.object({
  roadmapId: z.string().min(1, '路线图ID不能为空'),
  name: z.string().min(1, '版本名称不能为空'),
  description: z.string().optional(),
  releaseDate: z.string().datetime().optional(),
  status: z
    .enum(['planned', 'in_development', 'testing', 'released', 'deprecated'])
    .default('planned'),
});

const updateVersionSchema = z.object({
  name: z.string().min(1, '版本名称不能为空').optional(),
  description: z.string().optional(),
  releaseDate: z.string().datetime().optional(),
  status: z.enum(['planned', 'in_development', 'testing', 'released', 'deprecated']).optional(),
});

const createFeatureSchema = z.object({
  milestoneId: z.string().optional(),
  versionId: z.string().optional(),
  name: z.string().min(1, '功能名称不能为空'),
  description: z.string().optional(),
  status: z
    .enum(['planned', 'in_development', 'testing', 'completed', 'cancelled'])
    .default('planned'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  effort: z.string().optional(),
});

const updateFeatureSchema = z.object({
  milestoneId: z.string().optional(),
  versionId: z.string().optional(),
  name: z.string().min(1, '功能名称不能为空').optional(),
  description: z.string().optional(),
  status: z.enum(['planned', 'in_development', 'testing', 'completed', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  effort: z.string().optional(),
});

export class RoadmapService {
  /**
   * 获取所有路线图
   */
  static async getAllRoadmaps(projectId?: string) {
    try {
      const roadmaps = await prisma.roadmap.findMany({
        where: projectId ? { projectId } : undefined,
        include: {
          project: true,
          milestones: true,
          versions: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return {
        success: true,
        data: roadmaps,
      };
    } catch {
      throw new Error('获取路线图列表失败');
    }
  }

  /**
   * 获取项目的所有路线图
   */
  static async getProjectRoadmaps(projectId: string) {
    try {
      const roadmaps = await prisma.roadmap.findMany({
        where: { projectId },
        include: {
          milestones: {
            include: {
              features: true,
            },
          },
          versions: {
            include: {
              features: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return {
        success: true,
        data: roadmaps,
      };
    } catch {
      throw new Error('获取项目路线图失败');
    }
  }

  /**
   * 根据ID获取路线图详情
   */
  static async getRoadmapById(id: string) {
    try {
      const roadmap = await prisma.roadmap.findUnique({
        where: { id },
        include: {
          project: true,
          milestones: {
            include: {
              features: {
                include: {
                  tasks: true,
                },
              },
            },
            orderBy: { targetDate: 'asc' },
          },
          versions: {
            include: {
              features: {
                include: {
                  tasks: true,
                },
              },
            },
            orderBy: { name: 'asc' },
          },
        },
      });

      if (!roadmap) {
        throw new Error('路线图不存在');
      }

      return {
        success: true,
        data: roadmap,
      };
    } catch {
      throw new Error('获取路线图详情失败');
    }
  }

  /**
   * 创建路线图
   */
  static async createRoadmap(data: z.infer<typeof createRoadmapSchema>) {
    try {
      const validatedData = createRoadmapSchema.parse(data);

      const roadmap = await prisma.roadmap.create({
        data: {
          projectId: validatedData.projectId,
          name: validatedData.name,
          description: validatedData.description,
          startDate: new Date(validatedData.startDate),
          endDate: new Date(validatedData.endDate),
          status: validatedData.status,
        },
        include: {
          project: true,
        },
      });

      return {
        success: true,
        data: roadmap,
        message: '路线图创建成功',
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('请求参数错误');
      }
      throw new Error('创建路线图失败');
    }
  }

  /**
   * 更新路线图
   */
  static async updateRoadmap(id: string, data: z.infer<typeof updateRoadmapSchema>) {
    try {
      const validatedData = updateRoadmapSchema.parse(data);

      const roadmap = await prisma.roadmap.update({
        where: { id },
        data: {
          name: validatedData.name,
          description: validatedData.description,
          startDate: validatedData.startDate ? new Date(validatedData.startDate) : undefined,
          endDate: validatedData.endDate ? new Date(validatedData.endDate) : undefined,
          status: validatedData.status,
        },
        include: {
          project: true,
        },
      });

      return {
        success: true,
        data: roadmap,
        message: '路线图更新成功',
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('请求参数错误');
      }
      throw new Error('更新路线图失败');
    }
  }

  /**
   * 删除路线图
   */
  static async deleteRoadmap(id: string) {
    try {
      await prisma.roadmap.delete({
        where: { id },
      });

      return {
        success: true,
        message: '路线图删除成功',
      };
    } catch {
      throw new Error('删除路线图失败');
    }
  }

  /**
   * 获取所有里程碑
   */
  static async getAllMilestones(projectId?: string) {
    try {
      const milestones = await prisma.milestone.findMany({
        where: projectId
          ? {
              roadmap: { projectId },
            }
          : undefined,
        include: {
          roadmap: true,
          features: true,
        },
        orderBy: { targetDate: 'asc' },
      });

      return {
        success: true,
        data: milestones,
      };
    } catch {
      throw new Error('获取里程碑列表失败');
    }
  }

  /**
   * 创建里程碑
   */
  static async createMilestone(data: z.infer<typeof createMilestoneSchema>) {
    try {
      const validatedData = createMilestoneSchema.parse(data);

      const milestone = await prisma.milestone.create({
        data: {
          roadmapId: validatedData.roadmapId,
          name: validatedData.name,
          description: validatedData.description,
          targetDate: new Date(validatedData.targetDate),
          status: validatedData.status,
          priority: validatedData.priority,
        },
        include: {
          roadmap: true,
        },
      });

      return {
        success: true,
        data: milestone,
        message: '里程碑创建成功',
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('请求参数错误');
      }
      throw new Error('创建里程碑失败');
    }
  }

  /**
   * 更新里程碑
   */
  static async updateMilestone(id: string, data: z.infer<typeof updateMilestoneSchema>) {
    try {
      const validatedData = updateMilestoneSchema.parse(data);

      const milestone = await prisma.milestone.update({
        where: { id },
        data: {
          name: validatedData.name,
          description: validatedData.description,
          targetDate: validatedData.targetDate ? new Date(validatedData.targetDate) : undefined,
          status: validatedData.status,
          priority: validatedData.priority,
        },
        include: {
          roadmap: true,
        },
      });

      return {
        success: true,
        data: milestone,
        message: '里程碑更新成功',
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('请求参数错误');
      }
      throw new Error('更新里程碑失败');
    }
  }

  /**
   * 删除里程碑
   */
  static async deleteMilestone(id: string) {
    try {
      await prisma.milestone.delete({
        where: { id },
      });

      return {
        success: true,
        message: '里程碑删除成功',
      };
    } catch {
      throw new Error('删除里程碑失败');
    }
  }

  /**
   * 获取所有版本
   */
  static async getAllVersions(projectId?: string) {
    try {
      const versions = await prisma.version.findMany({
        where: projectId
          ? {
              roadmap: { projectId },
            }
          : undefined,
        include: {
          roadmap: true,
          features: true,
        },
        orderBy: { name: 'asc' },
      });

      return {
        success: true,
        data: versions,
      };
    } catch {
      throw new Error('获取版本列表失败');
    }
  }

  /**
   * 创建版本
   */
  static async createVersion(data: z.infer<typeof createVersionSchema>) {
    try {
      const validatedData = createVersionSchema.parse(data);

      const version = await prisma.version.create({
        data: {
          roadmapId: validatedData.roadmapId,
          name: validatedData.name,
          description: validatedData.description,
          releaseDate: validatedData.releaseDate ? new Date(validatedData.releaseDate) : null,
          status: validatedData.status,
        },
        include: {
          roadmap: true,
        },
      });

      return {
        success: true,
        data: version,
        message: '版本创建成功',
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('请求参数错误');
      }
      throw new Error('创建版本失败');
    }
  }

  /**
   * 更新版本
   */
  static async updateVersion(id: string, data: z.infer<typeof updateVersionSchema>) {
    try {
      const validatedData = updateVersionSchema.parse(data);

      const version = await prisma.version.update({
        where: { id },
        data: {
          name: validatedData.name,
          description: validatedData.description,
          releaseDate: validatedData.releaseDate ? new Date(validatedData.releaseDate) : undefined,
          status: validatedData.status,
        },
        include: {
          roadmap: true,
        },
      });

      return {
        success: true,
        data: version,
        message: '版本更新成功',
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('请求参数错误');
      }
      throw new Error('更新版本失败');
    }
  }

  /**
   * 删除版本
   */
  static async deleteVersion(id: string) {
    try {
      await prisma.version.delete({
        where: { id },
      });

      return {
        success: true,
        message: '版本删除成功',
      };
    } catch {
      throw new Error('删除版本失败');
    }
  }

  /**
   * 创建功能
   */
  static async createFeature(data: z.infer<typeof createFeatureSchema>) {
    try {
      const validatedData = createFeatureSchema.parse(data);

      const feature = await prisma.feature.create({
        data: {
          milestoneId: validatedData.milestoneId,
          versionId: validatedData.versionId,
          name: validatedData.name,
          description: validatedData.description,
          status: validatedData.status,
          priority: validatedData.priority,
          effort: validatedData.effort,
        },
        include: {
          milestone: true,
          version: true,
        },
      });

      return {
        success: true,
        data: feature,
        message: '功能创建成功',
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('请求参数错误');
      }
      throw new Error('创建功能失败');
    }
  }

  /**
   * 更新功能
   */
  static async updateFeature(id: string, data: z.infer<typeof updateFeatureSchema>) {
    try {
      const validatedData = updateFeatureSchema.parse(data);

      const feature = await prisma.feature.update({
        where: { id },
        data: {
          milestoneId: validatedData.milestoneId,
          versionId: validatedData.versionId,
          name: validatedData.name,
          description: validatedData.description,
          status: validatedData.status,
          priority: validatedData.priority,
          effort: validatedData.effort,
        },
        include: {
          milestone: true,
          version: true,
          tasks: true,
        },
      });

      return {
        success: true,
        data: feature,
        message: '功能更新成功',
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('请求参数错误');
      }
      throw new Error('更新功能失败');
    }
  }

  /**
   * 删除功能
   */
  static async deleteFeature(id: string) {
    try {
      await prisma.feature.delete({
        where: { id },
      });

      return {
        success: true,
        message: '功能删除成功',
      };
    } catch {
      throw new Error('删除功能失败');
    }
  }

  /**
   * 获取路线图统计信息
   */
  static async getRoadmapStats(projectId: string) {
    try {
      const [roadmapCount, milestoneCount, versionCount, featureCount] = await Promise.all([
        prisma.roadmap.count({ where: { projectId } }),
        prisma.milestone.count({
          where: {
            roadmap: { projectId },
          },
        }),
        prisma.version.count({
          where: {
            roadmap: { projectId },
          },
        }),
        prisma.feature.count({
          where: {
            OR: [
              { milestone: { roadmap: { projectId } } },
              { version: { roadmap: { projectId } } },
            ],
          },
        }),
      ]);

      return {
        success: true,
        data: {
          roadmapCount,
          milestoneCount,
          versionCount,
          featureCount,
        },
      };
    } catch {
      throw new Error('获取路线图统计信息失败');
    }
  }
}
