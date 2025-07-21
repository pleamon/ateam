import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ServiceAdapter } from '../../mcp/service-adapter';

// 增强的数据结构路由 - 支持MCP工具定义的格式
export default async function enhancedDataStructureRoutes(fastify: FastifyInstance) {
  // 获取所有数据结构
  fastify.get('/v2/data-structures', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { projectId } = request.query as { projectId?: string };
      const result = await ServiceAdapter.getAllDataStructures(projectId);
      return reply.send(result);
    } catch (error) {
      return reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : '获取数据结构列表失败',
      });
    }
  });

  // 创建数据结构
  fastify.post('/v2/data-structures', {
    schema: {
      body: {
        type: 'object',
        required: ['projectId', 'name', 'type'],
        properties: {
          projectId: { type: 'string' },
          name: { type: 'string' },
          type: {
            type: 'string',
            enum: ['entity', 'value_object', 'aggregate', 'dto', 'enum']
          },
          fields: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                type: { type: 'string' },
                required: { type: 'boolean' },
                description: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await ServiceAdapter.createDataStructure(request.body as any);
      return reply.status(201).send(result);
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : '创建数据结构失败',
      });
    }
  });
}