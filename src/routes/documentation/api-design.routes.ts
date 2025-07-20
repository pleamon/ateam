import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ApiDesignService } from '../../services/documentation/api-design.service';

export default async function apiDesignRoutes(fastify: FastifyInstance) {
  // 创建API设计
  fastify.post('/api-designs', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await ApiDesignService.createApiDesign(request.body as any);
      return reply.status(201).send(result);
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : '创建API设计失败',
      });
    }
  });

  // 获取项目的所有API设计
  fastify.get(
    '/projects/:projectId/api-designs',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { projectId } = request.params as { projectId: string };
        const result = await ApiDesignService.getProjectApiDesigns(projectId);
        return reply.send(result);
      } catch (error) {
        return reply.status(500).send({
          success: false,
          error: error instanceof Error ? error.message : '获取项目API设计列表失败',
        });
      }
    },
  );

  // 根据平台获取项目的API设计
  fastify.get(
    '/projects/:projectId/api-designs/platform/:platform',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { projectId, platform } = request.params as {
          projectId: string;
          platform: string;
        };
        const result = await ApiDesignService.getApiDesignsByPlatform(projectId, platform);
        return reply.send(result);
      } catch (error) {
        return reply.status(500).send({
          success: false,
          error: error instanceof Error ? error.message : '获取平台API设计失败',
        });
      }
    },
  );

  // 根据ID获取API设计
  fastify.get('/api-designs/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const result = await ApiDesignService.getApiDesignById(id);
      return reply.send(result);
    } catch (error) {
      return reply.status(404).send({
        success: false,
        error: error instanceof Error ? error.message : '获取API设计详情失败',
      });
    }
  });

  // 更新API设计
  fastify.put('/api-designs/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const result = await ApiDesignService.updateApiDesign(id, request.body as any);
      return reply.send(result);
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : '更新API设计失败',
      });
    }
  });

  // 删除API设计
  fastify.delete('/api-designs/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const result = await ApiDesignService.deleteApiDesign(id);
      return reply.send(result);
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : '删除API设计失败',
      });
    }
  });
}
