import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { TeamService } from '../../services/team/team.service';

export default async function teamRoutes(fastify: FastifyInstance) {
    // 获取所有团队
    fastify.get('/teams', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { projectId } = request.query as { projectId?: string };
            const result = await TeamService.getAllTeams(projectId);
            return reply.send(result);
        } catch (error) {
            return reply.status(500).send({
                success: false,
                error: error instanceof Error ? error.message : '获取团队列表失败',
            });
        }
    });

    // 根据ID获取团队
    fastify.get('/teams/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as { id: string };
            const result = await TeamService.getTeamById(id);
            return reply.send(result);
        } catch (error) {
            return reply.status(404).send({
                success: false,
                error: error instanceof Error ? error.message : '获取团队详情失败',
            });
        }
    });

    // 创建团队
    fastify.post('/teams', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const result = await TeamService.createTeam(request.body as any);
            return reply.status(201).send(result);
        } catch (error) {
            return reply.status(400).send({
                success: false,
                error: error instanceof Error ? error.message : '创建团队失败',
            });
        }
    });

    // 更新团队
    fastify.put('/teams/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as { id: string };
            const result = await TeamService.updateTeam(id, request.body as any);
            return reply.send(result);
        } catch (error) {
            return reply.status(400).send({
                success: false,
                error: error instanceof Error ? error.message : '更新团队失败',
            });
        }
    });

    // 删除团队
    fastify.delete('/teams/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as { id: string };
            const result = await TeamService.deleteTeam(id);
            return reply.send(result);
        } catch (error) {
            return reply.status(400).send({
                success: false,
                error: error instanceof Error ? error.message : '删除团队失败',
            });
        }
    });

    // 添加团队成员
    fastify.post('/teams/:id/members', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as { id: string };
            const result = await TeamService.addTeamMember(id, request.body as any);
            return reply.status(201).send(result);
        } catch (error) {
            return reply.status(400).send({
                success: false,
                error: error instanceof Error ? error.message : '添加团队成员失败',
            });
        }
    });

    // 获取团队成员
    fastify.get('/teams/:id/members', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as { id: string };
            const result = await TeamService.getTeamMembers(id);
            return reply.send(result);
        } catch (error) {
            return reply.status(500).send({
                success: false,
                error: error instanceof Error ? error.message : '获取团队成员失败',
            });
        }
    });

    // 更新团队成员
    fastify.put('/teams/:teamId/members/:memberId', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { teamId, memberId } = request.params as { teamId: string; memberId: string };
            const result = await TeamService.updateTeamMember(teamId, memberId, request.body as any);
            return reply.send(result);
        } catch (error) {
            return reply.status(400).send({
                success: false,
                error: error instanceof Error ? error.message : '更新团队成员失败',
            });
        }
    });

    // 删除团队成员
    fastify.delete('/teams/:teamId/members/:memberId', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { teamId, memberId } = request.params as { teamId: string; memberId: string };
            const result = await TeamService.removeTeamMember(teamId, memberId);
            return reply.send(result);
        } catch (error) {
            return reply.status(400).send({
                success: false,
                error: error instanceof Error ? error.message : '删除团队成员失败',
            });
        }
    });

    // 获取团队统计信息
    fastify.get('/teams/:id/stats', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as { id: string };
            const result = await TeamService.getTeamStats(id);
            return reply.send(result);
        } catch (error) {
            return reply.status(500).send({
                success: false,
                error: error instanceof Error ? error.message : '获取团队统计信息失败',
            });
        }
    });
} 