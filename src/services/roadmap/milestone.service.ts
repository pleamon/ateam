import { PrismaClient } from '../../../generated/prisma';
import { z } from 'zod';

const prisma = new PrismaClient();

// 请求验证schema
const createMilestoneSchema = z.object({
  roadmapId: z.string().min(1, '路线图ID不能为空'),
  name: z.string().min(1, '里程碑名称不能为空').max(100),
  description: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  status: z.enum(['pending', 'in_progress', 'completed', 'delayed']).default('pending'),
});

const updateMilestoneSchema = z.object({
  name: z.string().min(1, '里程碑名称不能为空').max(100).optional(),
  description: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'delayed']).optional(),
});

export class MilestoneService {
  /**
   * 获取里程碑列表
   */
  static async getAllMilestones(roadmapId?: string) {
    try {
      const milestones = await prisma.milestone.findMany({
        where: roadmapId ? { roadmapId } : undefined,
        include: {
          roadmap: {
            include: {
              project: true,
            },
          },
          versions: {
            include: {
              features: true,
            },
          },
        },
        orderBy: {
          startDate: 'asc',
        },
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
   * 根据ID获取里程碑
   */
  static async getMilestoneById(id: string) {
    try {
      const milestone = await prisma.milestone.findUnique({
        where: { id },
        include: {
          roadmap: {
            include: {
              project: true,
            },
          },
          versions: {
            include: {
              features: {
                orderBy: {
                  priority: 'desc',
                },
              },
            },
            orderBy: {
              releaseDate: 'asc',
            },
          },
        },
      });

      if (!milestone) {
        throw new Error('里程碑不存在');
      }

      return {
        success: true,
        data: milestone,
      };
    } catch {
      throw new Error('获取里程碑详情失败');
    }
  }

  /**
   * 创建里程碑
   */
  static async createMilestone(data: z.infer<typeof createMilestoneSchema>) {
    try {
      const validatedData = createMilestoneSchema.parse(data);

      // 验证日期逻辑
      const startDate = new Date(validatedData.startDate);
      const endDate = new Date(validatedData.endDate);
      
      if (endDate <= startDate) {
        throw new Error('结束日期必须晚于开始日期');
      }

      // 检查路线图是否存在
      const roadmap = await prisma.roadmap.findUnique({
        where: { id: validatedData.roadmapId },
      });

      if (!roadmap) {
        throw new Error('路线图不存在');
      }

      const milestone = await prisma.milestone.create({
        data: {
          roadmapId: validatedData.roadmapId,
          name: validatedData.name,
          description: validatedData.description,
          startDate,
          endDate,
          status: validatedData.status,
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
      throw error;
    }
  }

  /**
   * 更新里程碑
   */
  static async updateMilestone(id: string, data: z.infer<typeof updateMilestoneSchema>) {
    try {
      const validatedData = updateMilestoneSchema.parse(data);

      // 如果更新日期，验证日期逻辑
      if (validatedData.startDate || validatedData.endDate) {
        const milestone = await prisma.milestone.findUnique({
          where: { id },
        });

        if (!milestone) {
          throw new Error('里程碑不存在');
        }

        const startDate = validatedData.startDate ? new Date(validatedData.startDate) : milestone.startDate;
        const endDate = validatedData.endDate ? new Date(validatedData.endDate) : milestone.endDate;

        if (endDate <= startDate) {
          throw new Error('结束日期必须晚于开始日期');
        }
      }

      const milestone = await prisma.milestone.update({
        where: { id },
        data: {
          name: validatedData.name,
          description: validatedData.description,
          startDate: validatedData.startDate ? new Date(validatedData.startDate) : undefined,
          endDate: validatedData.endDate ? new Date(validatedData.endDate) : undefined,
          status: validatedData.status,
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
      throw error;
    }
  }

  /**
   * 删除里程碑
   */
  static async deleteMilestone(id: string) {
    try {
      // 检查是否有关联的版本
      const versionsCount = await prisma.version.count({
        where: { milestoneId: id },
      });

      if (versionsCount > 0) {
        throw new Error('该里程碑下还有版本，无法删除');
      }

      await prisma.milestone.delete({
        where: { id },
      });

      return {
        success: true,
        message: '里程碑删除成功',
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * 更新里程碑状态
   */
  static async updateMilestoneStatus(id: string, status: string) {
    try {
      const milestone = await prisma.milestone.update({
        where: { id },
        data: { status },
      });

      // 如果状态改为completed，检查是否所有版本都已发布
      if (status === 'completed') {
        const unreleasedVersions = await prisma.version.count({
          where: {
            milestoneId: id,
            status: {
              not: 'released',
            },
          },
        });

        if (unreleasedVersions > 0) {
          // 可以选择警告或自动更新版本状态
          console.warn(`里程碑 ${id} 被标记为完成，但还有 ${unreleasedVersions} 个版本未发布`);
        }
      }

      return {
        success: true,
        data: milestone,
        message: '里程碑状态更新成功',
      };
    } catch {
      throw new Error('更新里程碑状态失败');
    }
  }

  /**
   * 获取里程碑进度
   */
  static async getMilestoneProgress(id: string) {
    try {
      const milestone = await prisma.milestone.findUnique({
        where: { id },
        include: {
          versions: {
            include: {
              features: true,
            },
          },
        },
      });

      if (!milestone) {
        throw new Error('里程碑不存在');
      }

      // 计算版本进度
      const totalVersions = milestone.versions.length;
      const releasedVersions = milestone.versions.filter(v => v.status === 'released').length;
      const versionProgress = totalVersions > 0 ? (releasedVersions / totalVersions) * 100 : 0;

      // 计算功能进度
      let totalFeatures = 0;
      let completedFeatures = 0;

      milestone.versions.forEach(version => {
        totalFeatures += version.features.length;
        completedFeatures += version.features.filter(f => f.status === 'completed').length;
      });

      const featureProgress = totalFeatures > 0 ? (completedFeatures / totalFeatures) * 100 : 0;

      // 计算时间进度
      const now = new Date();
      const startDate = new Date(milestone.startDate);
      const endDate = new Date(milestone.endDate);
      const totalDuration = endDate.getTime() - startDate.getTime();
      const elapsedDuration = now.getTime() - startDate.getTime();
      const timeProgress = Math.min(100, Math.max(0, (elapsedDuration / totalDuration) * 100));

      return {
        success: true,
        data: {
          milestone,
          progress: {
            versions: {
              total: totalVersions,
              released: releasedVersions,
              percentage: versionProgress,
            },
            features: {
              total: totalFeatures,
              completed: completedFeatures,
              percentage: featureProgress,
            },
            time: {
              startDate: milestone.startDate,
              endDate: milestone.endDate,
              percentage: timeProgress,
              daysRemaining: Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))),
            },
            overall: (versionProgress + featureProgress + timeProgress) / 3,
          },
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * 获取项目的所有里程碑
   */
  static async getProjectMilestones(projectId: string) {
    try {
      const milestones = await prisma.milestone.findMany({
        where: {
          roadmap: {
            projectId,
          },
        },
        include: {
          roadmap: true,
          _count: {
            select: {
              versions: true,
            },
          },
        },
        orderBy: {
          startDate: 'asc',
        },
      });

      return {
        success: true,
        data: milestones,
      };
    } catch {
      throw new Error('获取项目里程碑失败');
    }
  }

  /**
   * 获取里程碑统计
   */
  static async getMilestoneStats(roadmapId?: string) {
    try {
      const where = roadmapId ? { roadmapId } : {};

      const [total, pending, inProgress, completed, delayed] = await Promise.all([
        prisma.milestone.count({ where }),
        prisma.milestone.count({ where: { ...where, status: 'pending' } }),
        prisma.milestone.count({ where: { ...where, status: 'in_progress' } }),
        prisma.milestone.count({ where: { ...where, status: 'completed' } }),
        prisma.milestone.count({ where: { ...where, status: 'delayed' } }),
      ]);

      return {
        success: true,
        data: {
          total,
          byStatus: {
            pending,
            inProgress,
            completed,
            delayed,
          },
        },
      };
    } catch {
      throw new Error('获取里程碑统计失败');
    }
  }
}