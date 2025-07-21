import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ServiceAdapter } from '../../mcp/service-adapter';

// 增强的API设计路由 - 支持MCP工具定义的格式
export default async function enhancedApiDesignRoutes(fastify: FastifyInstance) {
  // 获取所有API设计文档
  fastify.get('/v2/api-designs', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { projectId } = request.query as { projectId?: string };
      const result = await ServiceAdapter.getAllApiDesigns(projectId);
      return reply.send(result);
    } catch (error) {
      return reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : '获取API设计列表失败',
      });
    }
  });

  // 创建API设计文档
  fastify.post('/v2/api-designs', {
    schema: {
      body: {
        type: 'object',
        required: ['projectId', 'name', 'method', 'path'],
        properties: {
          projectId: { type: 'string' },
          name: { type: 'string' },
          method: {
            type: 'string',
            enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
          },
          path: { type: 'string' },
          description: { type: 'string' },
          requestBody: { type: 'object' },
          responseBody: { type: 'object' }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await ServiceAdapter.createApiDesign(request.body as any);
      return reply.status(201).send(result);
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : '创建API设计失败',
      });
    }
  });
}