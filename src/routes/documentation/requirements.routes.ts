import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { RequirementsService } from '../../services/documentation/requirements.service';

export default async function requirementsRoutes(fastify: FastifyInstance) {
  // 创建需求
  fastify.post('/requirements', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await RequirementsService.createRequirement(request.body as any);
      return reply.status(201).send(result);
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : '创建需求失败',
      });
    }
  });

  // 获取项目需求
  fastify.get(
    '/projects/:projectId/requirements',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { projectId } = request.params as { projectId: string };
        const result = await RequirementsService.getProjectRequirements(projectId);
        return reply.send(result);
      } catch (error) {
        return reply.status(500).send({
          success: false,
          error: error instanceof Error ? error.message : '获取项目需求失败',
        });
      }
    },
  );

  // 根据ID获取需求
  fastify.get('/requirements/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const result = await RequirementsService.getRequirementById(id);
      return reply.send(result);
    } catch (error) {
      return reply.status(404).send({
        success: false,
        error: error instanceof Error ? error.message : '获取需求详情失败',
      });
    }
  });

  // 更新需求
  fastify.put('/requirements/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const result = await RequirementsService.updateRequirement(id, request.body as any);
      return reply.send(result);
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : '更新需求失败',
      });
    }
  });

  // 删除需求
  fastify.delete('/requirements/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const result = await RequirementsService.deleteRequirement(id);
      return reply.send(result);
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : '删除需求失败',
      });
    }
  });

  // 创建需求问题
  fastify.post('/requirement-questions', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await RequirementsService.createRequirementQuestion(request.body as any);
      return reply.status(201).send(result);
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : '创建问题失败',
      });
    }
  });

  // 获取项目问题
  fastify.get(
    '/projects/:projectId/questions',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { projectId } = request.params as { projectId: string };
        const result = await RequirementsService.getProjectQuestions(projectId);
        return reply.send(result);
      } catch (error) {
        return reply.status(500).send({
          success: false,
          error: error instanceof Error ? error.message : '获取项目问题失败',
        });
      }
    },
  );

  // 根据ID获取问题
  fastify.get(
    '/requirement-questions/:id',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { id } = request.params as { id: string };
        const result = await RequirementsService.getQuestionById(id);
        return reply.send(result);
      } catch (error) {
        return reply.status(404).send({
          success: false,
          error: error instanceof Error ? error.message : '获取问题详情失败',
        });
      }
    },
  );

  // 更新问题
  fastify.put(
    '/requirement-questions/:id',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { id } = request.params as { id: string };
        const result = await RequirementsService.updateRequirementQuestion(id, request.body as any);
        return reply.send(result);
      } catch (error) {
        return reply.status(400).send({
          success: false,
          error: error instanceof Error ? error.message : '更新问题失败',
        });
      }
    },
  );

  // 删除问题
  fastify.delete(
    '/requirement-questions/:id',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { id } = request.params as { id: string };
        const result = await RequirementsService.deleteRequirementQuestion(id);
        return reply.send(result);
      } catch (error) {
        return reply.status(400).send({
          success: false,
          error: error instanceof Error ? error.message : '删除问题失败',
        });
      }
    },
  );
}
