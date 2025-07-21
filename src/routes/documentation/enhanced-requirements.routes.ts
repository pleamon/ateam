import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ServiceAdapter } from '../../mcp/service-adapter';

// 增强的需求管理路由 - 支持MCP工具定义的格式
export default async function enhancedRequirementsRoutes(fastify: FastifyInstance) {
  // 获取所有需求（支持MCP格式）
  fastify.get('/v2/requirements', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { projectId } = request.query as { projectId?: string };
      const result = await ServiceAdapter.getAllRequirements(projectId);
      return reply.send(result);
    } catch (error) {
      return reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : '获取需求列表失败',
      });
    }
  });

  // 创建需求（支持MCP格式）
  fastify.post('/v2/requirements', {
    schema: {
      body: {
        type: 'object',
        required: ['projectId', 'title', 'type', 'priority'],
        properties: {
          projectId: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          type: { 
            type: 'string',
            enum: ['functional', 'non_functional', 'business', 'technical', 'constraint']
          },
          priority: {
            type: 'string',
            enum: ['critical', 'high', 'medium', 'low']
          },
          source: {
            type: 'string',
            enum: ['client', 'internal', 'market', 'regulatory', 'technical']
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await ServiceAdapter.createRequirement(request.body as any);
      return reply.status(201).send(result);
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : '创建需求失败',
      });
    }
  });

  // 更新需求（支持MCP格式）
  fastify.put('/v2/requirements/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          status: {
            type: 'string',
            enum: ['draft', 'reviewing', 'approved', 'implementing', 'testing', 'completed', 'cancelled']
          },
          priority: {
            type: 'string',
            enum: ['critical', 'high', 'medium', 'low']
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const result = await ServiceAdapter.updateRequirement(id, request.body as any);
      return reply.send(result);
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : '更新需求失败',
      });
    }
  });
}