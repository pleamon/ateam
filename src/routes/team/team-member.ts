import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { TeamMemberService } from '../../services/team/teammember.service';

export default async function teamMemberRoutes(fastify: FastifyInstance) {
    fastify.get('/:teamId/team-members', async (request: FastifyRequest, reply: FastifyReply) => {
        const { teamId } = request.params as { teamId: string };
        const result = await TeamMemberService.getTeamMembers(teamId);
        return reply.send(result);
    });

    fastify.get('/team-members/:teamMemberId', async (request: FastifyRequest, reply: FastifyReply) => {
        const { teamMemberId } = request.params as { teamMemberId: string };
        const result = await TeamMemberService.getTeamMemberById(teamMemberId);
        return reply.send(result);
    });

    fastify.post('/team-members/:teamMemberId', async (request: FastifyRequest, reply: FastifyReply) => {
        const { teamId } = request.params as { teamId: string };
        const result = await TeamMemberService.createTeamMember(teamId, request.body);
        return reply.send(result);
    });

    fastify.put('/team-members/:teamMemberId', async (request: FastifyRequest, reply: FastifyReply) => {
        const { teamMemberId } = request.params as { teamMemberId: string };
        const result = await TeamMemberService.updateTeamMember(teamMemberId, request.body);
        return reply.send(result);
    });

    fastify.delete('/team-members/:teamMemberId', async (request: FastifyRequest, reply: FastifyReply) => {
        const { teamMemberId } = request.params as { teamMemberId: string };
        const result = await TeamMemberService.deleteTeamMember(teamMemberId);
        return reply.send(result);
    });

    fastify.get('/team-members/:teamMemberId/worklog', async (request: FastifyRequest, reply: FastifyReply) => {
        const { teamMemberId } = request.params as { teamMemberId: string };
        const result = await TeamMemberService.getTeamMemberWorklog(teamMemberId);
        return reply.send(result);
    });

    fastify.get('/team-members/:teamMemberId/task', async (request: FastifyRequest, reply: FastifyReply) => {
        const { teamMemberId } = request.params as { teamMemberId: string };
        const result = await TeamMemberService.getTeamMemberTask(teamMemberId);
        return reply.send(result);
    });

    fastify.get('/team-members/:teamMemberId/activity', async (request: FastifyRequest, reply: FastifyReply) => {
        const { teamMemberId } = request.params as { teamMemberId: string };
        const result = await TeamMemberService.getTeamMemberActivity(teamMemberId);
        return reply.send(result);
    });
}