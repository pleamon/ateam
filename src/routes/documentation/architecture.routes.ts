import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ArchitectureService } from '../../services/documentation/architecture.service';

export default async function architectureRoutes(fastify: FastifyInstance) {
    // 创建系统架构
    fastify.post('/system-architecture', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const result = await ArchitectureService.createSystemArchitecture(request.body as any);
            return reply.status(201).send(result);
        } catch (error) {
            return reply.status(400).send({
                success: false,
                error: error instanceof Error ? error.message : '创建系统架构失败',
            });
        }
    });

    // 获取项目系统架构
    fastify.get('/projects/:projectId/system-architecture', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { projectId } = request.params as { projectId: string };
            const result = await ArchitectureService.getProjectSystemArchitecture(projectId);
            return reply.send(result);
        } catch (error) {
            return reply.status(500).send({
                success: false,
                error: error instanceof Error ? error.message : '获取项目系统架构失败',
            });
        }
    });

    // 更新系统架构
    fastify.put('/system-architecture/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as { id: string };
            const result = await ArchitectureService.updateSystemArchitecture(id, request.body as any);
            return reply.send(result);
        } catch (error) {
            return reply.status(400).send({
                success: false,
                error: error instanceof Error ? error.message : '更新系统架构失败',
            });
        }
    });

    // 删除系统架构
    fastify.delete('/system-architecture/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as { id: string };
            const result = await ArchitectureService.deleteSystemArchitecture(id);
            return reply.send(result);
        } catch (error) {
            return reply.status(400).send({
                success: false,
                error: error instanceof Error ? error.message : '删除系统架构失败',
            });
        }
    });

    // 创建平台架构
    fastify.post('/platform-architecture', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const result = await ArchitectureService.createPlatformArchitecture(request.body as any);
            return reply.status(201).send(result);
        } catch (error) {
            return reply.status(400).send({
                success: false,
                error: error instanceof Error ? error.message : '创建平台架构失败',
            });
        }
    });

    // 获取系统架构的平台架构列表
    fastify.get('/system-architecture/:systemArchitectureId/platforms', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { systemArchitectureId } = request.params as { systemArchitectureId: string };
            const result = await ArchitectureService.getSystemPlatformArchitectures(systemArchitectureId);
            return reply.send(result);
        } catch (error) {
            return reply.status(500).send({
                success: false,
                error: error instanceof Error ? error.message : '获取平台架构列表失败',
            });
        }
    });

    // 更新平台架构
    fastify.put('/platform-architecture/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as { id: string };
            const result = await ArchitectureService.updatePlatformArchitecture(id, request.body as any);
            return reply.send(result);
        } catch (error) {
            return reply.status(400).send({
                success: false,
                error: error instanceof Error ? error.message : '更新平台架构失败',
            });
        }
    });

    // 删除平台架构
    fastify.delete('/platform-architecture/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as { id: string };
            const result = await ArchitectureService.deletePlatformArchitecture(id);
            return reply.send(result);
        } catch (error) {
            return reply.status(400).send({
                success: false,
                error: error instanceof Error ? error.message : '删除平台架构失败',
            });
        }
    });
}