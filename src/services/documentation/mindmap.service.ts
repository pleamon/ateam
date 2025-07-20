import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// MindMap 相关的 Schema
export const createMindMapSchema = z.object({
  projectId: z.string().min(1, '项目ID不能为空'),
  content: z.string().min(1, '脑图内容不能为空'),
  // 脑图数据结构：包含节点信息、连接关系等
  nodes: z
    .array(
      z.object({
        id: z.string(),
        text: z.string(),
        parentId: z.string().nullable(),
        position: z
          .object({
            x: z.number(),
            y: z.number(),
          })
          .optional(),
        style: z
          .object({
            color: z.string().optional(),
            fontSize: z.number().optional(),
            backgroundColor: z.string().optional(),
          })
          .optional(),
        children: z.array(z.string()).optional(),
      }),
    )
    .optional(),
  // 保留原始 content 字段用于存储序列化的脑图数据
});

export const updateMindMapSchema = z.object({
  content: z.string().min(1, '脑图内容不能为空').optional(),
  nodes: z
    .array(
      z.object({
        id: z.string(),
        text: z.string(),
        parentId: z.string().nullable(),
        position: z
          .object({
            x: z.number(),
            y: z.number(),
          })
          .optional(),
        style: z
          .object({
            color: z.string().optional(),
            fontSize: z.number().optional(),
            backgroundColor: z.string().optional(),
          })
          .optional(),
        children: z.array(z.string()).optional(),
      }),
    )
    .optional(),
});

export class MindMapService {
  /**
   * 创建脑图 (MindMap)
   */
  static async createMindMap(data: z.infer<typeof createMindMapSchema>) {
    try {
      const validatedData = createMindMapSchema.parse(data);

      // 如果提供了 nodes，将其序列化为 content
      let { content } = validatedData;
      if (validatedData.nodes && validatedData.nodes.length > 0) {
        content = JSON.stringify({
          nodes: validatedData.nodes,
          version: '1.0',
          type: 'mindmap',
        });
      }

      const mindmap = await prisma.minimap.create({
        data: {
          projectId: validatedData.projectId,
          content,
        },
      });

      return {
        success: true,
        data: mindmap,
        message: '脑图创建成功',
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('请求参数错误');
      }
      throw new Error('创建脑图失败');
    }
  }

  /**
   * 获取项目脑图 (MindMap)
   */
  static async getProjectMindMap(projectId: string) {
    try {
      const mindmap = await prisma.minimap.findFirst({
        where: { projectId },
        include: {
          project: true,
        },
      });

      // 如果 content 是 JSON 格式，尝试解析
      if (mindmap && mindmap.content) {
        try {
          const parsedContent = JSON.parse(mindmap.content);
          if (parsedContent.type === 'mindmap' && parsedContent.nodes) {
            return {
              success: true,
              data: {
                ...mindmap,
                nodes: parsedContent.nodes,
                parsedContent,
              },
            };
          }
        } catch {
          // 如果解析失败，返回原始数据
        }
      }

      return {
        success: true,
        data: mindmap,
      };
    } catch {
      throw new Error('获取项目脑图失败');
    }
  }

  /**
   * 更新脑图 (MindMap)
   */
  static async updateMindMap(id: string, data: z.infer<typeof updateMindMapSchema>) {
    try {
      const validatedData = updateMindMapSchema.parse(data);

      // 如果提供了 nodes，将其序列化为 content
      let { content } = validatedData;
      if (validatedData.nodes && validatedData.nodes.length > 0) {
        content = JSON.stringify({
          nodes: validatedData.nodes,
          version: '1.0',
          type: 'mindmap',
        });
      }

      const mindmap = await prisma.minimap.update({
        where: { id },
        data: {
          content,
        },
      });

      return {
        success: true,
        data: mindmap,
        message: '脑图更新成功',
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('请求参数错误');
      }
      throw new Error('更新脑图失败');
    }
  }

  /**
   * 删除脑图 (MindMap)
   */
  static async deleteMindMap(id: string) {
    try {
      await prisma.minimap.delete({
        where: { id },
      });

      return {
        success: true,
        message: '脑图删除成功',
      };
    } catch {
      throw new Error('删除脑图失败');
    }
  }
}
