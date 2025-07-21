import { PrismaClient, RequirementType, RequirementPriority, RequirementStatus, RequirementSource } from '../../../generated/prisma';
import { z } from 'zod';

const prisma = new PrismaClient();

// 请求验证schema
const createRequirementSchema = z.object({
  projectId: z.string().min(1, '项目ID不能为空'),
  title: z.string().min(1, '需求标题不能为空').max(200),
  content: z.string().min(1, '需求内容不能为空'),
  type: z.nativeEnum(RequirementType),
  priority: z.nativeEnum(RequirementPriority),
  status: z.nativeEnum(RequirementStatus).default(RequirementStatus.DRAFT),
  source: z.nativeEnum(RequirementSource),
  parentId: z.string().optional(),
  assigneeId: z.string().optional(),
  createdBy: z.string().min(1, '创建者ID不能为空'),
});

const updateRequirementSchema = z.object({
  title: z.string().min(1, '需求标题不能为空').max(200).optional(),
  content: z.string().min(1, '需求内容不能为空').optional(),
  type: z.nativeEnum(RequirementType).optional(),
  priority: z.nativeEnum(RequirementPriority).optional(),
  status: z.nativeEnum(RequirementStatus).optional(),
  source: z.nativeEnum(RequirementSource).optional(),
  assigneeId: z.string().optional(),
  updatedBy: z.string().min(1, '更新者ID不能为空'),
});

export class RequirementService {
  /**
   * 获取需求列表
   */
  static async getAllRequirements(projectId?: string, filters?: {
    type?: RequirementType;
    priority?: RequirementPriority;
    status?: RequirementStatus;
    source?: RequirementSource;
    assigneeId?: string;
    parentId?: string | null;
  }) {
    try {
      const where: any = {
        deletedAt: null,
      };

      if (projectId) where.projectId = projectId;
      if (filters?.type) where.type = filters.type;
      if (filters?.priority) where.priority = filters.priority;
      if (filters?.status) where.status = filters.status;
      if (filters?.source) where.source = filters.source;
      if (filters?.assigneeId) where.assigneeId = filters.assigneeId;
      if (filters?.parentId !== undefined) where.parentId = filters.parentId;

      const requirements = await prisma.requirement.findMany({
        where,
        include: {
          project: true,
          parent: true,
          children: {
            where: { deletedAt: null },
          },
          assignee: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar: true,
            },
          },
          creator: {
            select: {
              id: true,
              username: true,
              name: true,
            },
          },
          updater: {
            select: {
              id: true,
              username: true,
              name: true,
            },
          },
          _count: {
            select: {
              questions: true,
              attachments: true,
              children: true,
            },
          },
        },
        orderBy: [
          { priority: 'asc' },
          { createdAt: 'desc' },
        ],
      });

      return {
        success: true,
        data: requirements,
      };
    } catch {
      throw new Error('获取需求列表失败');
    }
  }

  /**
   * 根据ID获取需求
   */
  static async getRequirementById(id: string) {
    try {
      const requirement = await prisma.requirement.findFirst({
        where: {
          id,
          deletedAt: null,
        },
        include: {
          project: true,
          parent: true,
          children: {
            where: { deletedAt: null },
            include: {
              assignee: true,
              _count: {
                select: {
                  questions: true,
                  attachments: true,
                },
              },
            },
          },
          assignee: true,
          creator: true,
          updater: true,
          questions: {
            include: {
              questioner: true,
              answerer: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
          attachments: {
            include: {
              uploader: true,
            },
          },
        },
      });

      if (!requirement) {
        throw new Error('需求不存在');
      }

      return {
        success: true,
        data: requirement,
      };
    } catch {
      throw new Error('获取需求详情失败');
    }
  }

  /**
   * 创建需求
   */
  static async createRequirement(data: z.infer<typeof createRequirementSchema>) {
    try {
      const validatedData = createRequirementSchema.parse(data);

      // 如果有父需求，检查是否存在
      if (validatedData.parentId) {
        const parentRequirement = await prisma.requirement.findFirst({
          where: {
            id: validatedData.parentId,
            deletedAt: null,
          },
        });

        if (!parentRequirement) {
          throw new Error('父需求不存在');
        }
      }

      const requirement = await prisma.requirement.create({
        data: {
          ...validatedData,
          createdBy: validatedData.createdBy,
          updatedBy: validatedData.createdBy,
        },
        include: {
          project: true,
          parent: true,
          assignee: true,
          creator: true,
        },
      });

      return {
        success: true,
        data: requirement,
        message: '需求创建成功',
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('请求参数错误');
      }
      throw error;
    }
  }

  /**
   * 更新需求
   */
  static async updateRequirement(id: string, data: z.infer<typeof updateRequirementSchema>) {
    try {
      const validatedData = updateRequirementSchema.parse(data);

      const requirement = await prisma.requirement.update({
        where: { id },
        data: {
          ...validatedData,
          version: {
            increment: 1,
          },
        },
        include: {
          project: true,
          assignee: true,
          updater: true,
        },
      });

      return {
        success: true,
        data: requirement,
        message: '需求更新成功',
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('请求参数错误');
      }
      throw new Error('更新需求失败');
    }
  }

  /**
   * 删除需求（软删除）
   */
  static async deleteRequirement(id: string) {
    try {
      // 检查是否有子需求
      const childrenCount = await prisma.requirement.count({
        where: {
          parentId: id,
          deletedAt: null,
        },
      });

      if (childrenCount > 0) {
        throw new Error('该需求下还有子需求，无法删除');
      }

      const requirement = await prisma.requirement.update({
        where: { id },
        data: {
          deletedAt: new Date(),
        },
      });

      return {
        success: true,
        data: requirement,
        message: '需求删除成功',
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * 更新需求状态
   */
  static async updateRequirementStatus(id: string, status: RequirementStatus, updatedBy: string) {
    try {
      const requirement = await prisma.requirement.update({
        where: { id },
        data: {
          status,
          updatedBy,
        },
      });

      return {
        success: true,
        data: requirement,
        message: '需求状态更新成功',
      };
    } catch {
      throw new Error('更新需求状态失败');
    }
  }

  /**
   * 分配需求
   */
  static async assignRequirement(id: string, assigneeId: string, updatedBy: string) {
    try {
      const requirement = await prisma.requirement.update({
        where: { id },
        data: {
          assigneeId,
          updatedBy,
        },
        include: {
          assignee: true,
        },
      });

      return {
        success: true,
        data: requirement,
        message: '需求分配成功',
      };
    } catch {
      throw new Error('分配需求失败');
    }
  }

  /**
   * 获取需求树形结构
   */
  static async getRequirementTree(projectId: string) {
    try {
      // 获取所有顶级需求
      const topLevelRequirements = await prisma.requirement.findMany({
        where: {
          projectId,
          parentId: null,
          deletedAt: null,
        },
        include: {
          children: {
            where: { deletedAt: null },
            include: {
              children: {
                where: { deletedAt: null },
              },
              _count: {
                select: {
                  questions: true,
                  attachments: true,
                },
              },
            },
          },
          _count: {
            select: {
              questions: true,
              attachments: true,
            },
          },
        },
        orderBy: [
          { priority: 'asc' },
          { createdAt: 'asc' },
        ],
      });

      return {
        success: true,
        data: topLevelRequirements,
      };
    } catch {
      throw new Error('获取需求树形结构失败');
    }
  }

  /**
   * 获取需求统计
   */
  static async getRequirementStats(projectId?: string) {
    try {
      const where: any = { deletedAt: null };
      if (projectId) where.projectId = projectId;

      const [
        total,
        byType,
        byPriority,
        byStatus,
        bySource,
      ] = await Promise.all([
        prisma.requirement.count({ where }),
        prisma.requirement.groupBy({
          by: ['type'],
          where,
          _count: true,
        }),
        prisma.requirement.groupBy({
          by: ['priority'],
          where,
          _count: true,
        }),
        prisma.requirement.groupBy({
          by: ['status'],
          where,
          _count: true,
        }),
        prisma.requirement.groupBy({
          by: ['source'],
          where,
          _count: true,
        }),
      ]);

      return {
        success: true,
        data: {
          total,
          byType: byType.reduce((acc, item) => {
            acc[item.type] = item._count;
            return acc;
          }, {} as Record<string, number>),
          byPriority: byPriority.reduce((acc, item) => {
            acc[item.priority] = item._count;
            return acc;
          }, {} as Record<string, number>),
          byStatus: byStatus.reduce((acc, item) => {
            acc[item.status] = item._count;
            return acc;
          }, {} as Record<string, number>),
          bySource: bySource.reduce((acc, item) => {
            acc[item.source] = item._count;
            return acc;
          }, {} as Record<string, number>),
        },
      };
    } catch {
      throw new Error('获取需求统计失败');
    }
  }
}