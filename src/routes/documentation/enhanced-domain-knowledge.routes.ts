import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ServiceAdapter } from '../../mcp/service-adapter';

// 增强的领域知识路由 - 支持MCP工具定义的格式
export default async function enhancedDomainKnowledgeRoutes(fastify: FastifyInstance) {
  // 获取所有领域知识
  fastify.get('/v2/domain-knowledge', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { projectId } = request.query as { projectId?: string };
      const result = await ServiceAdapter.getAllDomainKnowledge(projectId);
      return reply.send(result);
    } catch (error) {
      return reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : '获取领域知识列表失败',
      });
    }
  });

  // 创建领域知识
  fastify.post('/v2/domain-knowledge', {
    schema: {
      body: {
        type: 'object',
        required: ['projectId', 'term', 'category', 'definition'],
        properties: {
          projectId: { type: 'string' },
          term: { type: 'string' },
          category: { type: 'string' },
          definition: { type: 'string' },
          context: { type: 'string' },
          examples: {
            type: 'array',
            items: { type: 'string' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await ServiceAdapter.createDomainKnowledge(request.body as any);
      return reply.status(201).send(result);
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : '创建领域知识失败',
      });
    }
  });
}