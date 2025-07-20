import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Data Structure 相关的 Schema
export const createDataStructureSchema = z.object({
  projectId: z.string().min(1, '项目ID不能为空'),
  schemaName: z.string().min(1, 'Schema名称不能为空'),
  tableName: z.string().min(1, '表名不能为空'),
  columnName: z.string().min(1, '列名不能为空'),
  columnType: z.string().min(1, '列类型不能为空'),
  columnDescription: z.string().min(1, '列描述不能为空'),
  columnDefaultValue: z.string(),
  columnIsNullable: z.boolean(),
  columnIsUnique: z.boolean(),
  columnIsPrimaryKey: z.boolean(),
  columnIsForeignKey: z.boolean(),
});

export const updateDataStructureSchema = z.object({
  schemaName: z.string().optional(),
  tableName: z.string().optional(),
  columnName: z.string().optional(),
  columnType: z.string().optional(),
  columnDescription: z.string().optional(),
  columnDefaultValue: z.string().optional(),
  columnIsNullable: z.boolean().optional(),
  columnIsUnique: z.boolean().optional(),
  columnIsPrimaryKey: z.boolean().optional(),
  columnIsForeignKey: z.boolean().optional(),
});

export class DataStructureService {
  /**
   * 创建数据结构
   */
  static async createDataStructure(data: z.infer<typeof createDataStructureSchema>) {
    try {
      const validatedData = createDataStructureSchema.parse(data);

      const dataStructure = await prisma.dataStructure.create({
        data: {
          projectId: validatedData.projectId,
          schemaName: validatedData.schemaName,
          tableName: validatedData.tableName,
          columnName: validatedData.columnName,
          columnType: validatedData.columnType,
          columnDescription: validatedData.columnDescription,
          columnDefaultValue: validatedData.columnDefaultValue,
          columnIsNullable: validatedData.columnIsNullable,
          columnIsUnique: validatedData.columnIsUnique,
          columnIsPrimaryKey: validatedData.columnIsPrimaryKey,
          columnIsForeignKey: validatedData.columnIsForeignKey,
        },
      });

      return {
        success: true,
        data: dataStructure,
        message: '数据结构创建成功',
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('请求参数错误');
      }
      throw new Error('创建数据结构失败');
    }
  }

  /**
   * 获取项目数据结构列表
   */
  static async getProjectDataStructures(projectId: string) {
    try {
      const dataStructures = await prisma.dataStructure.findMany({
        where: { projectId },
        include: {
          project: true,
        },
        orderBy: [{ schemaName: 'asc' }, { tableName: 'asc' }, { columnName: 'asc' }],
      });

      return {
        success: true,
        data: dataStructures,
      };
    } catch {
      throw new Error('获取项目数据结构列表失败');
    }
  }

  /**
   * 按表名获取数据结构
   */
  static async getDataStructuresByTable(projectId: string, tableName: string) {
    try {
      const dataStructures = await prisma.dataStructure.findMany({
        where: {
          projectId,
          tableName,
        },
        include: {
          project: true,
        },
        orderBy: {
          columnName: 'asc',
        },
      });

      return {
        success: true,
        data: dataStructures,
      };
    } catch {
      throw new Error('获取表数据结构失败');
    }
  }

  /**
   * 根据ID获取数据结构
   */
  static async getDataStructureById(id: string) {
    try {
      const dataStructure = await prisma.dataStructure.findUnique({
        where: { id },
        include: {
          project: true,
        },
      });

      if (!dataStructure) {
        throw new Error('数据结构不存在');
      }

      return {
        success: true,
        data: dataStructure,
      };
    } catch {
      throw new Error('获取数据结构详情失败');
    }
  }

  /**
   * 更新数据结构
   */
  static async updateDataStructure(id: string, data: z.infer<typeof updateDataStructureSchema>) {
    try {
      const validatedData = updateDataStructureSchema.parse(data);

      const dataStructure = await prisma.dataStructure.update({
        where: { id },
        data: {
          schemaName: validatedData.schemaName,
          tableName: validatedData.tableName,
          columnName: validatedData.columnName,
          columnType: validatedData.columnType,
          columnDescription: validatedData.columnDescription,
          columnDefaultValue: validatedData.columnDefaultValue,
          columnIsNullable: validatedData.columnIsNullable,
          columnIsUnique: validatedData.columnIsUnique,
          columnIsPrimaryKey: validatedData.columnIsPrimaryKey,
          columnIsForeignKey: validatedData.columnIsForeignKey,
        },
      });

      return {
        success: true,
        data: dataStructure,
        message: '数据结构更新成功',
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('请求参数错误');
      }
      throw new Error('更新数据结构失败');
    }
  }

  /**
   * 删除数据结构
   */
  static async deleteDataStructure(id: string) {
    try {
      await prisma.dataStructure.delete({
        where: { id },
      });

      return {
        success: true,
        message: '数据结构删除成功',
      };
    } catch {
      throw new Error('删除数据结构失败');
    }
  }

  /**
   * 批量创建数据结构
   */
  static async batchCreateDataStructures(
    projectId: string,
    dataStructures: Array<Omit<z.infer<typeof createDataStructureSchema>, 'projectId'>>,
  ) {
    try {
      const validatedData = dataStructures.map((item) => {
        const fullItem = {
          ...item,
          projectId,
        };
        return createDataStructureSchema.parse(fullItem);
      });

      const result = await prisma.dataStructure.createMany({
        data: validatedData,
      });

      return {
        success: true,
        data: result,
        message: `成功创建 ${result.count} 个数据结构`,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('请求参数错误');
      }
      throw new Error('批量创建数据结构失败');
    }
  }
}
