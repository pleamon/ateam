import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ProjectService } from '../services/project.service';

export default async function projectRoutes(fastify: FastifyInstance) {
    // 获取所有项目
    fastify.get('/projects', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const result = await ProjectService.getAllProjects();
            return reply.send(result);
        } catch (error) {
            return reply.status(500).send({
                success: false,
                error: error instanceof Error ? error.message : '获取项目列表失败',
            });
        }
    });

    // 根据ID获取项目
    fastify.get('/projects/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as { id: string };
            const result = await ProjectService.getProjectById(id);
            return reply.send(result);
        } catch (error) {
            return reply.status(404).send({
                success: false,
                error: error instanceof Error ? error.message : '获取项目详情失败',
            });
        }
    });

    // 创建项目
    fastify.post('/projects', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const result = await ProjectService.createProject(request.body as any);
            return reply.status(201).send(result);
        } catch (error) {
            return reply.status(400).send({
                success: false,
                error: error instanceof Error ? error.message : '创建项目失败',
            });
        }
    });

    // 更新项目
    fastify.put('/projects/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as { id: string };
            const result = await ProjectService.updateProject(id, request.body as any);
            return reply.send(result);
        } catch (error) {
            return reply.status(400).send({
                success: false,
                error: error instanceof Error ? error.message : '更新项目失败',
            });
        }
    });

    // 删除项目
    fastify.delete('/projects/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as { id: string };
            const result = await ProjectService.deleteProject(id);
            return reply.send(result);
        } catch (error) {
            return reply.status(400).send({
                success: false,
                error: error instanceof Error ? error.message : '删除项目失败',
            });
        }
    });

    // 获取项目统计信息
    fastify.get('/projects/:id/stats', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as { id: string };
            const result = await ProjectService.getProjectStats(id);
            return reply.send(result);
        } catch (error) {
            return reply.status(500).send({
                success: false,
                error: error instanceof Error ? error.message : '获取项目统计信息失败',
            });
        }
    });
} 