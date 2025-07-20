import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { DocumentationService } from '../../services/documentation';

export default async function documentationBaseRoutes(fastify: FastifyInstance) {
  // 获取所有文档
  fastify.get('/documentation', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { projectId } = request.query as { projectId?: string };
      const result = await DocumentationService.getAllDocumentation(projectId);
      return reply.send(result);
    } catch (error) {
      return reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : '获取文档列表失败',
      });
    }
  });

  // 根据ID获取文档
  fastify.get('/documentation/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const result = await DocumentationService.getDocumentationById(id);
      return reply.send(result);
    } catch (error) {
      return reply.status(404).send({
        success: false,
        error: error instanceof Error ? error.message : '获取文档详情失败',
      });
    }
  });

  // 创建文档
  fastify.post('/documentation', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await DocumentationService.createDocumentation(request.body as any);
      return reply.status(201).send(result);
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : '创建文档失败',
      });
    }
  });

  // 更新文档
  fastify.put('/documentation/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const result = await DocumentationService.updateDocumentation(id, request.body as any);
      return reply.send(result);
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : '更新文档失败',
      });
    }
  });

  // 删除文档
  fastify.delete('/documentation/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const result = await DocumentationService.deleteDocumentation(id);
      return reply.send(result);
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : '删除文档失败',
      });
    }
  });

  // 获取文档统计信息
  fastify.get('/documentation/stats', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { projectId } = request.query as { projectId?: string };
      const result = await DocumentationService.getDocumentationStats(projectId);
      return reply.send(result);
    } catch (error) {
      return reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : '获取文档统计信息失败',
      });
    }
  });
}
