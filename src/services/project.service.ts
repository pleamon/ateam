import { PrismaClient } from '../../generated/prisma';
import { z } from 'zod';

const prisma = new PrismaClient();

// 请求验证schema
const createProjectSchema = z.object({
    name: z.string().min(1, '项目名称不能为空'),
    description: z.string().optional(),
});

const updateProjectSchema = z.object({
    name: z.string().min(1, '项目名称不能为空').optional(),
    description: z.string().optional(),
});

export class ProjectService {
    /**
     * 获取所有项目
     */
    static async getAllProjects() {
        try {
            const projects = await prisma.project.findMany({
                include: {
                    tasks: true,
                    documentation: true,
                    Sprint: true,
                    Requirement: true,
                    DomainKnowledge: true,
                    SystemArchitecture: true,
                },
            });

            return {
                success: true,
                data: projects,
            };
        } catch (error) {
            throw new Error('获取项目列表失败');
        }
    }

    /**
     * 根据ID获取项目
     */
    static async getProjectById(id: string) {
        try {
            const project = await prisma.project.findUnique({
                where: { id },
                include: {
                    tasks: true,
                    documentation: true,
                    Sprint: true,
                    Requirement: true,
                    DomainKnowledge: true,
                    SystemArchitecture: true,
                },
            });

            if (!project) {
                throw new Error('项目不存在');
            }

            return {
                success: true,
                data: project,
            };
        } catch (error) {
            throw new Error('获取项目详情失败');
        }
    }

    /**
     * 创建项目
     */
    static async createProject(data: z.infer<typeof createProjectSchema>) {
        try {
            const validatedData = createProjectSchema.parse(data);

            const project = await prisma.project.create({
                data: {
                    name: validatedData.name,
                    description: validatedData.description,
                },
            });

            return {
                success: true,
                data: project,
                message: '项目创建成功',
            };
        } catch (error) {
            if (error instanceof z.ZodError) {
                throw new Error('请求参数错误');
            }
            throw new Error('创建项目失败');
        }
    }

    /**
     * 更新项目
     */
    static async updateProject(id: string, data: z.infer<typeof updateProjectSchema>) {
        try {
            const validatedData = updateProjectSchema.parse(data);

            const project = await prisma.project.update({
                where: { id },
                data: {
                    name: validatedData.name,
                    description: validatedData.description,
                },
            });

            return {
                success: true,
                data: project,
                message: '项目更新成功',
            };
        } catch (error) {
            if (error instanceof z.ZodError) {
                throw new Error('请求参数错误');
            }
            throw new Error('更新项目失败');
        }
    }

    /**
     * 删除项目
     */
    static async deleteProject(id: string) {
        try {
            await prisma.project.delete({
                where: { id },
            });

            return {
                success: true,
                message: '项目删除成功',
            };
        } catch (error) {
            throw new Error('删除项目失败');
        }
    }

    /**
     * 获取项目统计信息
     */
    static async getProjectStats(projectId: string) {
        try {
            const [taskCount, sprintCount, docCount] = await Promise.all([
                prisma.task.count({ where: { projectId } }),
                prisma.sprint.count({ where: { projectId } }),
                prisma.documentation.count({ where: { projectId } }),
            ]);

            return {
                success: true,
                data: {
                    taskCount,
                    sprintCount,
                    docCount,
                },
            };
        } catch (error) {
            throw new Error('获取项目统计信息失败');
        }
    }
} 