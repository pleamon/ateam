import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Requirement 相关的 Schema
export const createRequirementSchema = z.object({
  projectId: z.string().min(1, '项目ID不能为空'),
  content: z.string().min(1, '需求内容不能为空'),
});

export const updateRequirementSchema = z.object({
  content: z.string().min(1, '需求内容不能为空'),
});

export const createRequirementQuestionSchema = z.object({
  projectId: z.string().min(1, '项目ID不能为空'),
  question: z.string().min(1, '问题不能为空'),
  answer: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done']).default('todo'),
  clarified: z.boolean().default(false),
});

export const updateRequirementQuestionSchema = z.object({
  question: z.string().optional(),
  answer: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  clarified: z.boolean().optional(),
});

export class RequirementsService {
  /**
   * 创建需求
   */
  static async createRequirement(data: z.infer<typeof createRequirementSchema>) {
    try {
      const validatedData = createRequirementSchema.parse(data);

      const requirement = await prisma.requirement.create({
        data: {
          projectId: validatedData.projectId,
          content: validatedData.content,
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
      throw new Error('创建需求失败');
    }
  }

  /**
   * 获取项目需求
   */
  static async getProjectRequirements(projectId: string) {
    try {
      const requirements = await prisma.requirement.findMany({
        where: { projectId },
        include: {
          project: true,
        },
      });

      return {
        success: true,
        data: requirements,
      };
    } catch {
      throw new Error('获取项目需求失败');
    }
  }

  /**
   * 根据ID获取需求
   */
  static async getRequirementById(id: string) {
    try {
      const requirement = await prisma.requirement.findUnique({
        where: { id },
        include: {
          project: true,
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
   * 更新需求
   */
  static async updateRequirement(id: string, data: z.infer<typeof updateRequirementSchema>) {
    try {
      const validatedData = updateRequirementSchema.parse(data);

      const requirement = await prisma.requirement.update({
        where: { id },
        data: {
          content: validatedData.content,
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
   * 删除需求
   */
  static async deleteRequirement(id: string) {
    try {
      await prisma.requirement.delete({
        where: { id },
      });

      return {
        success: true,
        message: '需求删除成功',
      };
    } catch {
      throw new Error('删除需求失败');
    }
  }

  /**
   * 创建需求问题
   */
  static async createRequirementQuestion(data: z.infer<typeof createRequirementQuestionSchema>) {
    try {
      const validatedData = createRequirementQuestionSchema.parse(data);

      const question = await prisma.requirementQuestion.create({
        data: {
          projectId: validatedData.projectId,
          question: validatedData.question,
          answer: validatedData.answer,
          status: validatedData.status,
          clarified: validatedData.clarified,
        },
      });

      return {
        success: true,
        data: question,
        message: '问题创建成功',
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('请求参数错误');
      }
      throw new Error('创建问题失败');
    }
  }

  /**
   * 获取项目问题
   */
  static async getProjectQuestions(projectId: string) {
    try {
      const questions = await prisma.requirementQuestion.findMany({
        where: { projectId },
        include: {
          project: true,
        },
      });

      return {
        success: true,
        data: questions,
      };
    } catch {
      throw new Error('获取项目问题失败');
    }
  }

  /**
   * 根据ID获取问题
   */
  static async getQuestionById(id: string) {
    try {
      const question = await prisma.requirementQuestion.findUnique({
        where: { id },
        include: {
          project: true,
        },
      });

      if (!question) {
        throw new Error('问题不存在');
      }

      return {
        success: true,
        data: question,
      };
    } catch {
      throw new Error('获取问题详情失败');
    }
  }

  /**
   * 更新问题
   */
  static async updateRequirementQuestion(
    id: string,
    data: z.infer<typeof updateRequirementQuestionSchema>,
  ) {
    try {
      const validatedData = updateRequirementQuestionSchema.parse(data);

      const question = await prisma.requirementQuestion.update({
        where: { id },
        data: {
          question: validatedData.question,
          answer: validatedData.answer,
          status: validatedData.status,
          clarified: validatedData.clarified,
        },
      });

      return {
        success: true,
        data: question,
        message: '问题更新成功',
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('请求参数错误');
      }
      throw new Error('更新问题失败');
    }
  }

  /**
   * 删除问题
   */
  static async deleteRequirementQuestion(id: string) {
    try {
      await prisma.requirementQuestion.delete({
        where: { id },
      });

      return {
        success: true,
        message: '问题删除成功',
      };
    } catch {
      throw new Error('删除问题失败');
    }
  }
}
