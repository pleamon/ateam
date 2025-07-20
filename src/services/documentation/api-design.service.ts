import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// API Design 相关的 Schema
export const createApiDesignSchema = z.object({
  projectId: z.string().min(1, '项目ID不能为空'),
  platform: z.string().min(1, '平台不能为空'),
  apiName: z.string().min(1, 'API名称不能为空'),
  apiPath: z.string().min(1, 'API路径不能为空'),
  apiMethod: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD']).default('GET'),
  apiContentType: z
    .enum([
      'application/json',
      'application/xml',
      'application/x-www-form-urlencoded',
      'multipart/form-data',
      'text/plain',
    ])
    .default('application/json'),
  apiDescription: z.string().min(1, 'API描述不能为空'),
  requestFields: z.string().min(1, '请求字段不能为空'),
  responseFields: z.string().min(1, '响应字段不能为空'),
});

export const updateApiDesignSchema = z.object({
  platform: z.string().optional(),
  apiName: z.string().optional(),
  apiPath: z.string().optional(),
  apiMethod: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD']).optional(),
  apiContentType: z
    .enum([
      'application/json',
      'application/xml',
      'application/x-www-form-urlencoded',
      'multipart/form-data',
      'text/plain',
    ])
    .optional(),
  apiDescription: z.string().optional(),
  requestFields: z.string().optional(),
  responseFields: z.string().optional(),
});

export class ApiDesignService {
  /**
   * 创建API设计
   */
  static async createApiDesign(data: z.infer<typeof createApiDesignSchema>) {
    try {
      const validatedData = createApiDesignSchema.parse(data);

      const apiDesign = await prisma.apiDesign.create({
        data: {
          projectId: validatedData.projectId,
          platform: validatedData.platform,
          apiName: validatedData.apiName,
          apiPath: validatedData.apiPath,
          apiMethod: validatedData.apiMethod,
          apiContentType: validatedData.apiContentType,
          apiDescription: validatedData.apiDescription,
          requestFields: validatedData.requestFields,
          responseFields: validatedData.responseFields,
        },
      });

      return {
        success: true,
        data: apiDesign,
        message: 'API设计创建成功',
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('请求参数错误');
      }
      throw new Error('创建API设计失败');
    }
  }

  /**
   * 获取项目API设计列表
   */
  static async getProjectApiDesigns(projectId: string) {
    try {
      const apiDesigns = await prisma.apiDesign.findMany({
        where: { projectId },
        include: {
          project: true,
        },
      });

      return {
        success: true,
        data: apiDesigns,
      };
    } catch {
      throw new Error('获取项目API设计列表失败');
    }
  }

  /**
   * 根据ID获取API设计
   */
  static async getApiDesignById(id: string) {
    try {
      const apiDesign = await prisma.apiDesign.findUnique({
        where: { id },
        include: {
          project: true,
        },
      });

      if (!apiDesign) {
        throw new Error('API设计不存在');
      }

      return {
        success: true,
        data: apiDesign,
      };
    } catch {
      throw new Error('获取API设计详情失败');
    }
  }

  /**
   * 更新API设计
   */
  static async updateApiDesign(id: string, data: z.infer<typeof updateApiDesignSchema>) {
    try {
      const validatedData = updateApiDesignSchema.parse(data);

      const apiDesign = await prisma.apiDesign.update({
        where: { id },
        data: {
          platform: validatedData.platform,
          apiName: validatedData.apiName,
          apiPath: validatedData.apiPath,
          apiMethod: validatedData.apiMethod,
          apiContentType: validatedData.apiContentType,
          apiDescription: validatedData.apiDescription,
          requestFields: validatedData.requestFields,
          responseFields: validatedData.responseFields,
        },
      });

      return {
        success: true,
        data: apiDesign,
        message: 'API设计更新成功',
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('请求参数错误');
      }
      throw new Error('更新API设计失败');
    }
  }

  /**
   * 删除API设计
   */
  static async deleteApiDesign(id: string) {
    try {
      await prisma.apiDesign.delete({
        where: { id },
      });

      return {
        success: true,
        message: 'API设计删除成功',
      };
    } catch {
      throw new Error('删除API设计失败');
    }
  }

  /**
   * 按平台获取API设计
   */
  static async getApiDesignsByPlatform(projectId: string, platform: string) {
    try {
      const apiDesigns = await prisma.apiDesign.findMany({
        where: {
          projectId,
          platform,
        },
        include: {
          project: true,
        },
      });

      return {
        success: true,
        data: apiDesigns,
      };
    } catch {
      throw new Error('获取平台API设计失败');
    }
  }
}
