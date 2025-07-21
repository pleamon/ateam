import { PrismaClient, DocumentType, DocumentStatus, DocumentVisibility } from '../../../generated/prisma';
import { z } from 'zod';

const prisma = new PrismaClient();

// 请求验证schema
const createDocumentationSchema = z.object({
  projectId: z.string().min(1, '项目ID不能为空'),
  title: z.string().min(1, '文档标题不能为空').max(200),
  content: z.string().min(1, '文档内容不能为空'),
  summary: z.string().max(500).optional(),
  type: z.nativeEnum(DocumentType).default(DocumentType.OVERVIEW),
  status: z.nativeEnum(DocumentStatus).default(DocumentStatus.DRAFT),
  visibility: z.nativeEnum(DocumentVisibility).default(DocumentVisibility.INTERNAL),
  category: z.string().optional(),
  url: z.string().url('URL格式不正确').optional(),
  userId: z.string().min(1, '用户ID不能为空'),
});

const updateDocumentationSchema = z.object({
  title: z.string().min(1, '文档标题不能为空').max(200).optional(),
  content: z.string().min(1, '文档内容不能为空').optional(),
  summary: z.string().max(500).optional(),
  type: z.nativeEnum(DocumentType).optional(),
  status: z.nativeEnum(DocumentStatus).optional(),
  visibility: z.nativeEnum(DocumentVisibility).optional(),
  category: z.string().optional(),
  url: z.string().url('URL格式不正确').optional(),
  userId: z.string().min(1, '用户ID不能为空'),
});

const addTagsSchema = z.object({
  tagIds: z.array(z.string()).min(1, '至少添加一个标签'),
});

export class DocumentationService {
  /**
   * 获取文档列表
   */
  static async getAllDocumentations(projectId?: string, filters?: {
    type?: DocumentType;
    status?: DocumentStatus;
    visibility?: DocumentVisibility;
    category?: string;
    userId?: string;
  }) {
    try {
      const where: any = {
        deletedAt: null,
      };

      if (projectId) where.projectId = projectId;
      if (filters?.type) where.type = filters.type;
      if (filters?.status) where.status = filters.status;
      if (filters?.visibility) where.visibility = filters.visibility;
      if (filters?.category) where.category = filters.category;
      if (filters?.userId) where.userId = filters.userId;

      const documentations = await prisma.documentation.findMany({
        where,
        include: {
          project: true,
          User: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar: true,
            },
          },
          tags: true,
          _count: {
            select: {
              comments: true,
              attachments: true,
              versions: true,
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });

      return {
        success: true,
        data: documentations,
      };
    } catch {
      throw new Error('获取文档列表失败');
    }
  }

  /**
   * 根据ID获取文档
   */
  static async getDocumentationById(id: string) {
    try {
      const documentation = await prisma.documentation.findFirst({
        where: {
          id,
          deletedAt: null,
        },
        include: {
          project: true,
          User: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar: true,
            },
          },
          tags: true,
          comments: {
            where: {
              parentId: null,
            },
            include: {
              User: {
                select: {
                  id: true,
                  username: true,
                  name: true,
                  avatar: true,
                },
              },
              replies: {
                include: {
                  User: {
                    select: {
                      id: true,
                      username: true,
                      name: true,
                      avatar: true,
                    },
                  },
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
          attachments: {
            include: {
              User: {
                select: {
                  id: true,
                  username: true,
                  name: true,
                },
              },
            },
          },
          versions: {
            include: {
              User: {
                select: {
                  id: true,
                  username: true,
                  name: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });

      if (!documentation) {
        throw new Error('文档不存在');
      }

      return {
        success: true,
        data: documentation,
      };
    } catch {
      throw new Error('获取文档详情失败');
    }
  }

  /**
   * 创建文档
   */
  static async createDocumentation(data: z.infer<typeof createDocumentationSchema>) {
    try {
      const validatedData = createDocumentationSchema.parse(data);

      const documentation = await prisma.documentation.create({
        data: {
          projectId: validatedData.projectId,
          title: validatedData.title,
          content: validatedData.content,
          summary: validatedData.summary,
          type: validatedData.type,
          status: validatedData.status,
          visibility: validatedData.visibility,
          category: validatedData.category,
          url: validatedData.url,
          userId: validatedData.userId,
          version: '1.0.0',
        },
        include: {
          project: true,
          User: true,
          tags: true,
        },
      });

      // 创建初始版本记录
      await prisma.documentVersion.create({
        data: {
          documentationId: documentation.id,
          version: '1.0.0',
          content: documentation.content,
          changeLog: '初始版本',
          userId: validatedData.userId,
        },
      });

      return {
        success: true,
        data: documentation,
        message: '文档创建成功',
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('请求参数错误');
      }
      throw new Error('创建文档失败');
    }
  }

  /**
   * 更新文档
   */
  static async updateDocumentation(id: string, data: z.infer<typeof updateDocumentationSchema>) {
    try {
      const validatedData = updateDocumentationSchema.parse(data);

      // 获取当前文档
      const currentDoc = await prisma.documentation.findFirst({
        where: { id, deletedAt: null },
      });

      if (!currentDoc) {
        throw new Error('文档不存在');
      }

      // 检查是否需要创建新版本
      const contentChanged = validatedData.content && validatedData.content !== currentDoc.content;

      // 更新文档
      const documentation = await prisma.documentation.update({
        where: { id },
        data: {
          ...validatedData,
          versionNumber: {
            increment: 1,
          },
          updatedAt: new Date(),
        },
        include: {
          project: true,
          User: true,
          tags: true,
        },
      });

      // 如果内容变更，创建新版本
      if (contentChanged) {
        const versionParts = currentDoc.version.split('.');
        const newVersion = `${versionParts[0]}.${parseInt(versionParts[1]) + 1}.0`;

        await prisma.documentation.update({
          where: { id },
          data: { version: newVersion },
        });

        await prisma.documentVersion.create({
          data: {
            documentationId: id,
            version: newVersion,
            content: validatedData.content!,
            changeLog: '内容更新',
            userId: validatedData.userId,
          },
        });
      }

      return {
        success: true,
        data: documentation,
        message: '文档更新成功',
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('请求参数错误');
      }
      throw error;
    }
  }

  /**
   * 删除文档（软删除）
   */
  static async deleteDocumentation(id: string) {
    try {
      const documentation = await prisma.documentation.update({
        where: { id },
        data: {
          deletedAt: new Date(),
        },
      });

      return {
        success: true,
        data: documentation,
        message: '文档删除成功',
      };
    } catch {
      throw new Error('删除文档失败');
    }
  }

  /**
   * 发布文档
   */
  static async publishDocumentation(id: string) {
    try {
      const documentation = await prisma.documentation.update({
        where: { id },
        data: {
          status: DocumentStatus.PUBLISHED,
          publishedAt: new Date(),
        },
      });

      return {
        success: true,
        data: documentation,
        message: '文档发布成功',
      };
    } catch {
      throw new Error('发布文档失败');
    }
  }

  /**
   * 归档文档
   */
  static async archiveDocumentation(id: string) {
    try {
      const documentation = await prisma.documentation.update({
        where: { id },
        data: {
          status: DocumentStatus.ARCHIVED,
        },
      });

      return {
        success: true,
        data: documentation,
        message: '文档归档成功',
      };
    } catch {
      throw new Error('归档文档失败');
    }
  }

  /**
   * 添加标签
   */
  static async addTags(id: string, data: z.infer<typeof addTagsSchema>) {
    try {
      const validatedData = addTagsSchema.parse(data);

      const documentation = await prisma.documentation.update({
        where: { id },
        data: {
          tags: {
            connect: validatedData.tagIds.map((tagId) => ({ id: tagId })),
          },
        },
        include: {
          tags: true,
        },
      });

      return {
        success: true,
        data: documentation,
        message: '标签添加成功',
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('请求参数错误');
      }
      throw new Error('添加标签失败');
    }
  }

  /**
   * 移除标签
   */
  static async removeTags(id: string, tagIds: string[]) {
    try {
      const documentation = await prisma.documentation.update({
        where: { id },
        data: {
          tags: {
            disconnect: tagIds.map((tagId) => ({ id: tagId })),
          },
        },
        include: {
          tags: true,
        },
      });

      return {
        success: true,
        data: documentation,
        message: '标签移除成功',
      };
    } catch {
      throw new Error('移除标签失败');
    }
  }

  /**
   * 搜索文档
   */
  static async searchDocumentations(query: string, projectId?: string) {
    try {
      const documentations = await prisma.documentation.findMany({
        where: {
          deletedAt: null,
          projectId: projectId || undefined,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
            { summary: { contains: query, mode: 'insensitive' } },
            { category: { contains: query, mode: 'insensitive' } },
          ],
        },
        include: {
          project: true,
          User: {
            select: {
              id: true,
              username: true,
              name: true,
            },
          },
          tags: true,
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });

      return {
        success: true,
        data: documentations,
      };
    } catch {
      throw new Error('搜索文档失败');
    }
  }

  /**
   * 获取文档统计
   */
  static async getDocumentationStats(projectId?: string) {
    try {
      const where: any = { deletedAt: null };
      if (projectId) where.projectId = projectId;

      const [total, draft, published, archived] = await Promise.all([
        prisma.documentation.count({ where }),
        prisma.documentation.count({
          where: { ...where, status: DocumentStatus.DRAFT },
        }),
        prisma.documentation.count({
          where: { ...where, status: DocumentStatus.PUBLISHED },
        }),
        prisma.documentation.count({
          where: { ...where, status: DocumentStatus.ARCHIVED },
        }),
      ]);

      // 按类型统计
      const byType = await prisma.documentation.groupBy({
        by: ['type'],
        where,
        _count: true,
      });

      // 按可见性统计
      const byVisibility = await prisma.documentation.groupBy({
        by: ['visibility'],
        where,
        _count: true,
      });

      return {
        success: true,
        data: {
          total,
          byStatus: {
            draft,
            published,
            archived,
          },
          byType: byType.reduce((acc, item) => {
            acc[item.type] = item._count;
            return acc;
          }, {} as Record<string, number>),
          byVisibility: byVisibility.reduce((acc, item) => {
            acc[item.visibility] = item._count;
            return acc;
          }, {} as Record<string, number>),
        },
      };
    } catch {
      throw new Error('获取文档统计失败');
    }
  }
}