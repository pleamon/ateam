import { PrismaClient } from '../../../generated/prisma';
import { z } from 'zod';

const prisma = new PrismaClient();

// Domain Knowledge 相关的 Schema
export const createDomainKnowledgeSchema = z.object({
    projectId: z.string().min(1, '项目ID不能为空'),
    domain: z.string().min(1, '领域名称不能为空'),
    concepts: z.array(z.string()).optional(),
    commonPatterns: z.array(z.string()).optional(),
    bestPractices: z.array(z.string()).optional(),
    antiPatterns: z.array(z.string()).optional(),
});

export const updateDomainKnowledgeSchema = z.object({
    domain: z.string().optional(),
    concepts: z.array(z.string()).optional(),
    commonPatterns: z.array(z.string()).optional(),
    bestPractices: z.array(z.string()).optional(),
    antiPatterns: z.array(z.string()).optional(),
});

export class DomainKnowledgeService {
    /**
     * 创建领域知识
     */
    static async createDomainKnowledge(data: z.infer<typeof createDomainKnowledgeSchema>) {
        try {
            const validatedData = createDomainKnowledgeSchema.parse(data);

            const domainKnowledge = await prisma.domainKnowledge.create({
                data: {
                    projectId: validatedData.projectId,
                    domain: validatedData.domain,
                    concepts: validatedData.concepts || [],
                    commonPatterns: validatedData.commonPatterns || [],
                    bestPractices: validatedData.bestPractices || [],
                    antiPatterns: validatedData.antiPatterns || [],
                },
            });

            return {
                success: true,
                data: domainKnowledge,
                message: '领域知识创建成功',
            };
        } catch (error) {
            if (error instanceof z.ZodError) {
                throw new Error('请求参数错误');
            }
            throw new Error('创建领域知识失败');
        }
    }

    /**
     * 获取项目领域知识
     */
    static async getProjectDomainKnowledge(projectId: string) {
        try {
            const domainKnowledge = await prisma.domainKnowledge.findMany({
                where: { projectId },
                include: {
                    project: true,
                },
            });

            return {
                success: true,
                data: domainKnowledge,
            };
        } catch (error) {
            throw new Error('获取项目领域知识失败');
        }
    }

    /**
     * 根据ID获取领域知识
     */
    static async getDomainKnowledgeById(id: string) {
        try {
            const domainKnowledge = await prisma.domainKnowledge.findUnique({
                where: { id },
                include: {
                    project: true,
                },
            });

            if (!domainKnowledge) {
                throw new Error('领域知识不存在');
            }

            return {
                success: true,
                data: domainKnowledge,
            };
        } catch (error) {
            throw new Error('获取领域知识详情失败');
        }
    }

    /**
     * 更新领域知识
     */
    static async updateDomainKnowledge(id: string, data: z.infer<typeof updateDomainKnowledgeSchema>) {
        try {
            const validatedData = updateDomainKnowledgeSchema.parse(data);

            const domainKnowledge = await prisma.domainKnowledge.update({
                where: { id },
                data: {
                    domain: validatedData.domain,
                    concepts: validatedData.concepts,
                    commonPatterns: validatedData.commonPatterns,
                    bestPractices: validatedData.bestPractices,
                    antiPatterns: validatedData.antiPatterns,
                },
            });

            return {
                success: true,
                data: domainKnowledge,
                message: '领域知识更新成功',
            };
        } catch (error) {
            if (error instanceof z.ZodError) {
                throw new Error('请求参数错误');
            }
            throw new Error('更新领域知识失败');
        }
    }

    /**
     * 删除领域知识
     */
    static async deleteDomainKnowledge(id: string) {
        try {
            await prisma.domainKnowledge.delete({
                where: { id },
            });

            return {
                success: true,
                message: '领域知识删除成功',
            };
        } catch (error) {
            throw new Error('删除领域知识失败');
        }
    }
}