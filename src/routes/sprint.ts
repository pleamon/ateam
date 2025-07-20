import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { SprintService } from '../services/sprint.service';

export default async function sprintRoutes(fastify: FastifyInstance) {
  // 获取所有Sprint
  fastify.get('/sprints', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { projectId } = request.query as { projectId?: string };
      const result = await SprintService.getAllSprints(projectId);
      return reply.send(result);
    } catch (error) {
      return reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : '获取Sprint列表失败',
      });
    }
  });

  // 根据ID获取Sprint
  fastify.get('/sprints/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const result = await SprintService.getSprintById(id);
      return reply.send(result);
    } catch (error) {
      return reply.status(404).send({
        success: false,
        error: error instanceof Error ? error.message : '获取Sprint详情失败',
      });
    }
  });

  // 创建Sprint
  fastify.post('/sprints', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await SprintService.createSprint(request.body as any);
      return reply.status(201).send(result);
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : '创建Sprint失败',
      });
    }
  });

  // 更新Sprint
  fastify.put('/sprints/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const result = await SprintService.updateSprint(id, request.body as any);
      return reply.send(result);
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : '更新Sprint失败',
      });
    }
  });

  // 删除Sprint
  fastify.delete('/sprints/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const result = await SprintService.deleteSprint(id);
      return reply.send(result);
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : '删除Sprint失败',
      });
    }
  });

  // 获取项目的所有Sprint
  fastify.get(
    '/projects/:projectId/sprints',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { projectId } = request.params as { projectId: string };
        const result = await SprintService.getProjectSprints(projectId);
        return reply.send(result);
      } catch (error) {
        return reply.status(500).send({
          success: false,
          error: error instanceof Error ? error.message : '获取项目Sprint列表失败',
        });
      }
    },
  );

  // 获取Sprint统计信息
  fastify.get('/sprints/stats', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { projectId } = request.query as { projectId?: string };
      const result = await SprintService.getSprintStats(projectId);
      return reply.send(result);
    } catch (error) {
      return reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : '获取Sprint统计信息失败',
      });
    }
  });

  // 获取当前活跃的Sprint
  fastify.get(
    '/projects/:projectId/sprints/active',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { projectId } = request.params as { projectId: string };
        const result = await SprintService.getActiveSprint(projectId);
        return reply.send(result);
      } catch (error) {
        return reply.status(500).send({
          success: false,
          error: error instanceof Error ? error.message : '获取活跃Sprint失败',
        });
      }
    },
  );
}
