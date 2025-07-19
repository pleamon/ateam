import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { RoadmapService } from '../services/roadmap.service';

export default async function roadmapRoutes(fastify: FastifyInstance) {
    // 获取所有路线图
    fastify.get('/roadmaps', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { projectId } = request.query as { projectId?: string };
            const result = await RoadmapService.getAllRoadmaps(projectId);
            return reply.send(result);
        } catch (error) {
            return reply.status(500).send({
                success: false,
                error: error instanceof Error ? error.message : '获取路线图列表失败',
            });
        }
    });

    // 获取项目路线图
    fastify.get('/projects/:projectId/roadmaps', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { projectId } = request.params as { projectId: string };
            const result = await RoadmapService.getProjectRoadmaps(projectId);
            return reply.send(result);
        } catch (error) {
            return reply.status(500).send({
                success: false,
                error: error instanceof Error ? error.message : '获取项目路线图失败',
            });
        }
    });

    // 根据ID获取路线图详情
    fastify.get('/roadmaps/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as { id: string };
            const result = await RoadmapService.getRoadmapById(id);
            return reply.send(result);
        } catch (error) {
            return reply.status(404).send({
                success: false,
                error: error instanceof Error ? error.message : '获取路线图详情失败',
            });
        }
    });

    // 创建路线图
    fastify.post('/roadmaps', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const result = await RoadmapService.createRoadmap(request.body as any);
            return reply.status(201).send(result);
        } catch (error) {
            return reply.status(400).send({
                success: false,
                error: error instanceof Error ? error.message : '创建路线图失败',
            });
        }
    });

    // 更新路线图
    fastify.put('/roadmaps/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as { id: string };
            const result = await RoadmapService.updateRoadmap(id, request.body as any);
            return reply.send(result);
        } catch (error) {
            return reply.status(400).send({
                success: false,
                error: error instanceof Error ? error.message : '更新路线图失败',
            });
        }
    });

    // 删除路线图
    fastify.delete('/roadmaps/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as { id: string };
            const result = await RoadmapService.deleteRoadmap(id);
            return reply.send(result);
        } catch (error) {
            return reply.status(400).send({
                success: false,
                error: error instanceof Error ? error.message : '删除路线图失败',
            });
        }
    });

    // 获取所有里程碑
    fastify.get('/milestones', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { projectId } = request.query as { projectId?: string };
            const result = await RoadmapService.getAllMilestones(projectId);
            return reply.send(result);
        } catch (error) {
            return reply.status(500).send({
                success: false,
                error: error instanceof Error ? error.message : '获取里程碑列表失败',
            });
        }
    });

    // 创建里程碑
    fastify.post('/milestones', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const result = await RoadmapService.createMilestone(request.body as any);
            return reply.status(201).send(result);
        } catch (error) {
            return reply.status(400).send({
                success: false,
                error: error instanceof Error ? error.message : '创建里程碑失败',
            });
        }
    });

    // 更新里程碑
    fastify.put('/milestones/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as { id: string };
            const result = await RoadmapService.updateMilestone(id, request.body as any);
            return reply.send(result);
        } catch (error) {
            return reply.status(400).send({
                success: false,
                error: error instanceof Error ? error.message : '更新里程碑失败',
            });
        }
    });

    // 删除里程碑
    fastify.delete('/milestones/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as { id: string };
            const result = await RoadmapService.deleteMilestone(id);
            return reply.send(result);
        } catch (error) {
            return reply.status(400).send({
                success: false,
                error: error instanceof Error ? error.message : '删除里程碑失败',
            });
        }
    });

    // 获取所有版本
    fastify.get('/versions', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { projectId } = request.query as { projectId?: string };
            const result = await RoadmapService.getAllVersions(projectId);
            return reply.send(result);
        } catch (error) {
            return reply.status(500).send({
                success: false,
                error: error instanceof Error ? error.message : '获取版本列表失败',
            });
        }
    });

    // 创建版本
    fastify.post('/versions', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const result = await RoadmapService.createVersion(request.body as any);
            return reply.status(201).send(result);
        } catch (error) {
            return reply.status(400).send({
                success: false,
                error: error instanceof Error ? error.message : '创建版本失败',
            });
        }
    });

    // 更新版本
    fastify.put('/versions/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as { id: string };
            const result = await RoadmapService.updateVersion(id, request.body as any);
            return reply.send(result);
        } catch (error) {
            return reply.status(400).send({
                success: false,
                error: error instanceof Error ? error.message : '更新版本失败',
            });
        }
    });

    // 删除版本
    fastify.delete('/versions/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as { id: string };
            const result = await RoadmapService.deleteVersion(id);
            return reply.send(result);
        } catch (error) {
            return reply.status(400).send({
                success: false,
                error: error instanceof Error ? error.message : '删除版本失败',
            });
        }
    });

    // 创建功能
    fastify.post('/features', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const result = await RoadmapService.createFeature(request.body as any);
            return reply.status(201).send(result);
        } catch (error) {
            return reply.status(400).send({
                success: false,
                error: error instanceof Error ? error.message : '创建功能失败',
            });
        }
    });

    // 更新功能
    fastify.put('/features/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as { id: string };
            const result = await RoadmapService.updateFeature(id, request.body as any);
            return reply.send(result);
        } catch (error) {
            return reply.status(400).send({
                success: false,
                error: error instanceof Error ? error.message : '更新功能失败',
            });
        }
    });

    // 删除功能
    fastify.delete('/features/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as { id: string };
            const result = await RoadmapService.deleteFeature(id);
            return reply.send(result);
        } catch (error) {
            return reply.status(400).send({
                success: false,
                error: error instanceof Error ? error.message : '删除功能失败',
            });
        }
    });

    // 获取路线图统计信息
    fastify.get('/projects/:projectId/roadmap-stats', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { projectId } = request.params as { projectId: string };
            const result = await RoadmapService.getRoadmapStats(projectId);
            return reply.send(result);
        } catch (error) {
            return reply.status(500).send({
                success: false,
                error: error instanceof Error ? error.message : '获取路线图统计信息失败',
            });
        }
    });
} 