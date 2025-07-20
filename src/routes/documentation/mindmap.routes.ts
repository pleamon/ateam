import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { MindMapService } from '../../services/documentation/mindmap.service';

export default async function mindMapRoutes(fastify: FastifyInstance) {
  // 创建脑图 (MindMap)
  fastify.post('/mindmap', async (request: FastifyRequest, reply: FastifyReply) => {
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

  // 获取项目脑图 (MindMap)
  fastify.get(
    '/projects/:projectId/mindmap',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { projectId } = request.params as { projectId: string };
        const result = await MindMapService.getProjectMindMap(projectId);
        return reply.send(result);
      } catch (error) {
        return reply.status(500).send({
          success: false,
          error: error instanceof Error ? error.message : '获取项目脑图失败',
        });
      }
    },
  );

  // 更新脑图 (MindMap)
  fastify.put('/mindmap/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const result = await MindMapService.updateMindMap(id, request.body as any);
      return reply.send(result);
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : '更新脑图失败',
      });
    }
  });

  // 删除脑图 (MindMap)
  fastify.delete('/mindmap/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const result = await MindMapService.deleteMindMap(id);
      return reply.send(result);
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : '删除脑图失败',
      });
    }
  });
}
