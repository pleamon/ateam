import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// 请求验证schema
const createSprintSchema = z.object({
  projectId: z.string().min(1, '项目ID不能为空'),
  name: z.string().min(1, 'Sprint名称不能为空'),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  goal: z.string().min(1, 'Sprint目标不能为空'),
  status: z.enum(['todo', 'in_progress', 'done']).default('todo'),
});

const updateSprintSchema = z.object({
  name: z.string().min(1, 'Sprint名称不能为空').optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  goal: z.string().min(1, 'Sprint目标不能为空').optional(),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
});

export class SprintService {
  /**
   * 获取所有Sprint
   */
  static async getAllSprints(projectId?: string) {
    try {
      const sprints = await prisma.sprint.findMany({
        where: projectId ? { projectId } : undefined,
        include: {
          project: true,
        },
      });

      return {
        success: true,
        data: sprints,
      };
    } catch {
      throw new Error('获取Sprint列表失败');
    }
  }

  /**
   * 根据ID获取Sprint
   */
  static async getSprintById(id: string) {
    try {
      const sprint = await prisma.sprint.findUnique({
        where: { id },
        include: {
          project: true,
        },
      });

      if (!sprint) {
        throw new Error('Sprint不存在');
      }

      return {
        success: true,
        data: sprint,
      };
    } catch {
      throw new Error('获取Sprint详情失败');
    }
  }

  /**
   * 创建Sprint
   */
  static async createSprint(data: z.infer<typeof createSprintSchema>) {
    try {
      const validatedData = createSprintSchema.parse(data);

      const sprint = await prisma.sprint.create({
        data: {
          projectId: validatedData.projectId,
          name: validatedData.name,
          startDate: new Date(validatedData.startDate),
          endDate: new Date(validatedData.endDate),
          goal: validatedData.goal,
          status: validatedData.status,
        },
      });

      return {
        success: true,
        data: sprint,
        message: 'Sprint创建成功',
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('请求参数错误');
      }
      throw new Error('创建Sprint失败');
    }
  }

  /**
   * 更新Sprint
   */
  static async updateSprint(id: string, data: z.infer<typeof updateSprintSchema>) {
    try {
      const validatedData = updateSprintSchema.parse(data);

      const sprint = await prisma.sprint.update({
        where: { id },
        data: {
          name: validatedData.name,
          startDate: validatedData.startDate ? new Date(validatedData.startDate) : undefined,
          endDate: validatedData.endDate ? new Date(validatedData.endDate) : undefined,
          goal: validatedData.goal,
          status: validatedData.status,
        },
      });

      return {
        success: true,
        data: sprint,
        message: 'Sprint更新成功',
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('请求参数错误');
      }
      throw new Error('更新Sprint失败');
    }
  }

  /**
   * 删除Sprint
   */
  static async deleteSprint(id: string) {
    try {
      await prisma.sprint.delete({
        where: { id },
      });

      return {
        success: true,
        message: 'Sprint删除成功',
      };
    } catch {
      throw new Error('删除Sprint失败');
    }
  }

  /**
   * 获取项目的所有Sprint
   */
  static async getProjectSprints(projectId: string) {
    try {
      const sprints = await prisma.sprint.findMany({
        where: { projectId },
        include: {
          project: true,
        },
        orderBy: {
          startDate: 'asc',
        },
      });

      return {
        success: true,
        data: sprints,
      };
    } catch {
      throw new Error('获取项目Sprint列表失败');
    }
  }

  /**
   * 获取Sprint统计信息
   */
  static async getSprintStats(projectId?: string) {
    try {
      const whereClause = projectId ? { projectId } : {};

      const [totalSprints, todoSprints, inProgressSprints, doneSprints] = await Promise.all([
        prisma.sprint.count({ where: whereClause }),
        prisma.sprint.count({ where: { ...whereClause, status: 'todo' } }),
        prisma.sprint.count({
          where: { ...whereClause, status: 'in_progress' },
        }),
        prisma.sprint.count({ where: { ...whereClause, status: 'done' } }),
      ]);

      return {
        success: true,
        data: {
          totalSprints,
          todoSprints,
          inProgressSprints,
          doneSprints,
        },
      };
    } catch {
      throw new Error('获取Sprint统计信息失败');
    }
  }

  /**
   * 获取当前活跃的Sprint
   */
  static async getActiveSprint(projectId: string) {
    try {
      const now = new Date();
      const activeSprint = await prisma.sprint.findFirst({
        where: {
          projectId,
          startDate: { lte: now },
          endDate: { gte: now },
          status: 'in_progress',
        },
        include: {
          project: true,
        },
      });

      return {
        success: true,
        data: activeSprint,
      };
    } catch {
      throw new Error('获取活跃Sprint失败');
    }
  }
}
