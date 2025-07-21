import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { MindMapService } from '../../services/documentation/mindmap.service';

// 增强的脑图路由 - 支持MCP工具定义的格式
export default async function enhancedMindmapRoutes(fastify: FastifyInstance) {
  // 获取项目脑图
  fastify.get('/v2/projects/:projectId/mindmap', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { projectId } = request.params as { projectId: string };
      const result = await MindMapService.getProjectMindMap(projectId);
      return reply.send(result);
    } catch (error) {
      return reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : '获取脑图失败',
      });
    }
  });

  // 创建或更新脑图
  fastify.post('/v2/mindmaps', {
    schema: {
      body: {
        type: 'object',
        required: ['projectId'],
        properties: {
          projectId: { type: 'string' },
          content: { type: 'string' },
          nodes: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                text: { type: 'string' },
                parentId: { type: 'string' },
                position: {
                  type: 'object',
                  properties: {
                    x: { type: 'number' },
                    y: { type: 'number' }
                  }
                }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await MindMapService.createMindMap(request.body as any);
      return reply.status(201).send(result);
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : '创建脑图失败',
      });
    }
  });
}