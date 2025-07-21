import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ServiceAdapter } from '../../mcp/service-adapter';

// 增强的架构设计路由 - 支持MCP工具定义的格式
export default async function enhancedArchitectureRoutes(fastify: FastifyInstance) {
  // 获取所有架构设计文档
  fastify.get('/v2/architectures', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { projectId } = request.query as { projectId?: string };
      const result = await ServiceAdapter.getAllArchitectures(projectId);
      return reply.send(result);
    } catch (error) {
      return reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : '获取架构设计列表失败',
      });
    }
  });

  // 创建架构设计文档
  fastify.post('/v2/architectures', {
    schema: {
      body: {
        type: 'object',
        required: ['projectId', 'name', 'type'],
        properties: {
          projectId: { type: 'string' },
          name: { type: 'string' },
          type: {
            type: 'string',
            enum: ['system', 'application', 'data', 'deployment', 'security', 'integration']
          },
          description: { type: 'string' },
          content: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await ServiceAdapter.createArchitecture(request.body as any);
      return reply.status(201).send(result);
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : '创建架构设计失败',
      });
    }
  });
}