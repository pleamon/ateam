export * from './mindmap.service';
export * from './requirements.service';
export * from './domain-knowledge.service';
export * from './architecture.service';
export * from './api-design.service';
export * from './data-structure.service';

// 保留原有的 Documentation 相关服务
import { PrismaClient } from '../../../generated/prisma';
import { z } from 'zod';

const prisma = new PrismaClient();

// Documentation 相关的 Schema
const createDocumentationSchema = z.object({
    projectId: z.string().min(1, '项目ID不能为空'),
    teamId: z.string().min(1, '团队ID不能为空'),
    name: z.string().min(1, '文档名称不能为空'),
    content: z.string().min(1, '文档内容不能为空'),
    type: z.enum(['overview', 'technical', 'design', 'research', 'other']).default('overview'),
    url: z.string().url().optional(),
});

const updateDocumentationSchema = z.object({
    name: z.string().min(1, '文档名称不能为空').optional(),
    content: z.string().min(1, '文档内容不能为空').optional(),
    type: z.enum(['overview', 'technical', 'design', 'research', 'other']).optional(),
    url: z.string().url().optional(),
});

export class DocumentationService {
    /**
     * 获取所有文档
     */
    static async getAllDocumentation(projectId?: string) {
        try {
            const documentation = await prisma.documentation.findMany({
                where: projectId ? { projectId } : undefined,
                include: {
                    project: true,
                    team: true,
                },
            });

            return {
                success: true,
                data: documentation,
            };
        } catch (error) {
            throw new Error('获取文档列表失败');
        }
    }

    /**
     * 根据ID获取文档
     */
    static async getDocumentationById(id: string) {
        try {
            const documentation = await prisma.documentation.findUnique({
                where: { id },
                include: {
                    project: true,
                    team: true,
                },
            });

            if (!documentation) {
                throw new Error('文档不存在');
            }

            return {
                success: true,
                data: documentation,
            };
        } catch (error) {
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
                    teamId: validatedData.teamId,
                    name: validatedData.name,
                    content: validatedData.content,
                    type: validatedData.type,
                    url: validatedData.url,
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

            const documentation = await prisma.documentation.update({
                where: { id },
                data: {
                    name: validatedData.name,
                    content: validatedData.content,
                    type: validatedData.type,
                    url: validatedData.url,
                },
            });

            return {
                success: true,
                data: documentation,
                message: '文档更新成功',
            };
        } catch (error) {
            if (error instanceof z.ZodError) {
                throw new Error('请求参数错误');
            }
            throw new Error('更新文档失败');
        }
    }

    /**
     * 删除文档
     */
    static async deleteDocumentation(id: string) {
        try {
            await prisma.documentation.delete({
                where: { id },
            });

            return {
                success: true,
                message: '文档删除成功',
            };
        } catch (error) {
            throw new Error('删除文档失败');
        }
    }

    /**
     * 获取文档统计信息
     */
    static async getDocumentationStats(projectId?: string) {
        try {
            const whereClause = projectId ? { projectId } : {};

            const [totalDocs, overviewDocs, technicalDocs, designDocs] = await Promise.all([
                prisma.documentation.count({ where: whereClause }),
                prisma.documentation.count({ where: { ...whereClause, type: 'overview' } }),
                prisma.documentation.count({ where: { ...whereClause, type: 'technical' } }),
                prisma.documentation.count({ where: { ...whereClause, type: 'design' } }),
            ]);

            return {
                success: true,
                data: {
                    totalDocs,
                    overviewDocs,
                    technicalDocs,
                    designDocs,
                },
            };
        } catch (error) {
            throw new Error('获取文档统计信息失败');
        }
    }
}