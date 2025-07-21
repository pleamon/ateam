import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// 请求验证schema
const createVersionSchema = z.object({
  roadmapId: z.string().min(1, '路线图ID不能为空'),
  name: z.string().min(1, '版本名称不能为空').max(100),
  description: z.string().optional(),
  releaseDate: z.string().datetime().optional(),
  status: z.enum(['planned', 'in_development', 'testing', 'released', 'deprecated']).default('planned'),
});

const updateVersionSchema = z.object({
  name: z.string().min(1, '版本名称不能为空').max(100).optional(),
  description: z.string().optional(),
  releaseDate: z.string().datetime().optional(),
  status: z.enum(['planned', 'in_development', 'testing', 'released', 'deprecated']).optional(),
});

export class VersionService {
  /**
   * 获取版本列表
   */
  static async getAllVersions() {
    try {
      const versions = await prisma.version.findMany({
        include: {
          roadmap: true,
          features: {
            orderBy: {
              priority: 'desc',
            },
          },
          _count: {
            select: {
              features: true,
            },
          },
        },
        orderBy: {
          releaseDate: 'asc',
        },
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
   * 根据ID获取版本
   */
  static async getVersionById(id: string) {
    try {
      const version = await prisma.version.findUnique({
        where: { id },
        include: {
          roadmap: true,
          features: {
            orderBy: [
              { priority: 'desc' },
              { createdAt: 'asc' },
            ],
          },
        },
      });

      if (!version) {
        throw new Error('版本不存在');
      }

      // 计算版本完成度
      const totalFeatures = version.features.length;
      const completedFeatures = version.features.filter(f => f.status === 'completed').length;
      const completionRate = totalFeatures > 0 ? (completedFeatures / totalFeatures) * 100 : 0;

      return {
        success: true,
        data: {
          ...version,
          stats: {
            totalFeatures,
            completedFeatures,
            completionRate,
          },
        },
      };
    } catch {
      throw new Error('获取版本详情失败');
    }
  }

  /**
   * 创建版本
   */
  static async createVersion(data: z.infer<typeof createVersionSchema>) {
    try {
      const validatedData = createVersionSchema.parse(data);

      // 检查路线图是否存在
      const roadmap = await prisma.roadmap.findUnique({
        where: { id: validatedData.roadmapId },
      });

      if (!roadmap) {
        throw new Error('路线图不存在');
      }

      // 检查版本名称是否已存在
      const existingVersion = await prisma.version.findFirst({
        where: {
          roadmapId: validatedData.roadmapId,
          name: validatedData.name,
        },
      });

      if (existingVersion) {
        throw new Error('该版本名称已存在');
      }

      // 如果提供了发布日期，验证是否在路线图时间范围内
      if (validatedData.releaseDate) {
        const releaseDate = new Date(validatedData.releaseDate);
        if (releaseDate < roadmap.startDate || releaseDate > roadmap.endDate) {
          throw new Error('发布日期必须在路线图时间范围内');
        }
      }

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
      throw error;
    }
  }

  /**
   * 更新版本
   */
  static async updateVersion(id: string, data: z.infer<typeof updateVersionSchema>) {
    try {
      const validatedData = updateVersionSchema.parse(data);

      // 如果要更新版本名称，检查是否已存在
      if (validatedData.name) {
        const currentVersion = await prisma.version.findUnique({
          where: { id },
        });

        if (!currentVersion) {
          throw new Error('版本不存在');
        }

        const existingVersion = await prisma.version.findFirst({
          where: {
            roadmapId: currentVersion.roadmapId,
            name: validatedData.name,
            NOT: { id },
          },
        });

        if (existingVersion) {
          throw new Error('该版本名称已存在');
        }
      }

      const version = await prisma.version.update({
        where: { id },
        data: {
          name: validatedData.name,
          description: validatedData.description,
          releaseDate: validatedData.releaseDate ? new Date(validatedData.releaseDate) : undefined,
          status: validatedData.status,
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
      throw error;
    }
  }

  /**
   * 删除版本
   */
  static async deleteVersion(id: string) {
    try {
      // 检查是否有关联的功能
      const featuresCount = await prisma.feature.count({
        where: { versionId: id },
      });

      if (featuresCount > 0) {
        throw new Error('该版本下还有功能特性，无法删除');
      }

      await prisma.version.delete({
        where: { id },
      });

      return {
        success: true,
        message: '版本删除成功',
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * 发布版本
   */
  static async releaseVersion(id: string) {
    try {
      // 检查是否所有功能都已完成
      const incompleteFeatures = await prisma.feature.count({
        where: {
          versionId: id,
          status: {
            not: 'completed',
          },
        },
      });

      if (incompleteFeatures > 0) {
        throw new Error(`还有 ${incompleteFeatures} 个功能未完成，无法发布版本`);
      }

      const version = await prisma.version.update({
        where: { id },
        data: {
          status: 'released',
          releaseDate: new Date(), // 更新为实际发布日期
        },
      });

      return {
        success: true,
        data: version,
        message: '版本发布成功',
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * 更新版本状态
   */
  static async updateVersionStatus(id: string, status: string) {
    try {
      const version = await prisma.version.update({
        where: { id },
        data: { status },
      });

      return {
        success: true,
        data: version,
        message: '版本状态更新成功',
      };
    } catch {
      throw new Error('更新版本状态失败');
    }
  }

  /**
   * 获取版本进度
   */
  static async getVersionProgress(id: string) {
    try {
      const version = await prisma.version.findUnique({
        where: { id },
        include: {
          features: true,
        },
      });

      if (!version) {
        throw new Error('版本不存在');
      }

      // 统计各状态的功能数量
      const featureStats = {
        total: version.features.length,
        planned: 0,
        in_development: 0,
        testing: 0,
        completed: 0,
        cancelled: 0,
      };

      version.features.forEach(feature => {
        switch (feature.status) {
          case 'planned':
            featureStats.planned++;
            break;
          case 'in_development':
            featureStats.in_development++;
            break;
          case 'testing':
            featureStats.testing++;
            break;
          case 'completed':
            featureStats.completed++;
            break;
          case 'cancelled':
            featureStats.cancelled++;
            break;
        }
      });

      // 计算进度
      const progress = featureStats.total > 0
        ? (featureStats.completed / featureStats.total) * 100
        : 0;

      // 计算剩余天数
      const now = new Date();
      const releaseDate = version.releaseDate;
      let daysRemaining = 0;
      let isOverdue = false;

      if (releaseDate) {
        daysRemaining = Math.ceil((releaseDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        isOverdue = daysRemaining < 0 && version.status !== 'released';
      }

      return {
        success: true,
        data: {
          version,
          progress: {
            percentage: progress,
            features: featureStats,
            daysRemaining: Math.max(0, daysRemaining),
            isOverdue,
          },
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * 获取项目的所有版本
   */
  static async getProjectVersions(projectId: string) {
    try {
      const versions = await prisma.version.findMany({
        where: {
          roadmap: {
            projectId,
          },
        },
        include: {
          roadmap: true,
          _count: {
            select: {
              features: true,
            },
          },
        },
        orderBy: {
          releaseDate: 'desc',
        },
      });

      return {
        success: true,
        data: versions,
      };
    } catch {
      throw new Error('获取项目版本失败');
    }
  }

  /**
   * 获取路线图的所有版本
   */
  static async getRoadmapVersions(roadmapId: string) {
    try {
      const versions = await prisma.version.findMany({
        where: { roadmapId },
        include: {
          features: {
            orderBy: {
              priority: 'desc',
            },
          },
          _count: {
            select: {
              features: true,
            },
          },
        },
        orderBy: {
          releaseDate: 'asc',
        },
      });

      return {
        success: true,
        data: versions,
      };
    } catch {
      throw new Error('获取路线图版本失败');
    }
  }

  /**
   * 获取版本统计
   */
  static async getVersionStats(roadmapId?: string) {
    try {
      const where = roadmapId ? { roadmapId } : {};

      const [total, planned, inDevelopment, testing, released, deprecated] = await Promise.all([
        prisma.version.count({ where }),
        prisma.version.count({ where: { ...where, status: 'planned' } }),
        prisma.version.count({ where: { ...where, status: 'in_development' } }),
        prisma.version.count({ where: { ...where, status: 'testing' } }),
        prisma.version.count({ where: { ...where, status: 'released' } }),
        prisma.version.count({ where: { ...where, status: 'deprecated' } }),
      ]);

      return {
        success: true,
        data: {
          total,
          byStatus: {
            planned,
            in_development: inDevelopment,
            testing,
            released,
            deprecated,
          },
        },
      };
    } catch {
      throw new Error('获取版本统计失败');
    }
  }
}