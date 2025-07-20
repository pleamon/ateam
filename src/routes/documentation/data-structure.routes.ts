import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { DataStructureService } from '../../services/documentation/data-structure.service';

export default async function dataStructureRoutes(fastify: FastifyInstance) {
  // 创建数据结构
  fastify.post('/data-structures', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await DataStructureService.createDataStructure(request.body as any);
      return reply.status(201).send(result);
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : '创建数据结构失败',
      });
    }
  });

  // 批量创建数据结构
  fastify.post(
    '/projects/:projectId/data-structures/batch',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { projectId } = request.params as { projectId: string };
        const { dataStructures } = request.body as { dataStructures: any[] };
        const result = await DataStructureService.batchCreateDataStructures(
          projectId,
          dataStructures,
        );
        return reply.status(201).send(result);
      } catch (error) {
        return reply.status(400).send({
          success: false,
          error: error instanceof Error ? error.message : '批量创建数据结构失败',
        });
      }
    },
  );

  // 获取项目的所有数据结构
  fastify.get(
    '/projects/:projectId/data-structures',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { projectId } = request.params as { projectId: string };
        const result = await DataStructureService.getProjectDataStructures(projectId);
        return reply.send(result);
      } catch (error) {
        return reply.status(500).send({
          success: false,
          error: error instanceof Error ? error.message : '获取项目数据结构列表失败',
        });
      }
    },
  );

  // 按表名获取数据结构
  fastify.get(
    '/projects/:projectId/data-structures/table/:tableName',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { projectId, tableName } = request.params as {
          projectId: string;
          tableName: string;
        };
        const result = await DataStructureService.getDataStructuresByTable(projectId, tableName);
        return reply.send(result);
      } catch (error) {
        return reply.status(500).send({
          success: false,
          error: error instanceof Error ? error.message : '获取表数据结构失败',
        });
      }
    },
  );

  // 根据ID获取数据结构
  fastify.get('/data-structures/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const result = await DataStructureService.getDataStructureById(id);
      return reply.send(result);
    } catch (error) {
      return reply.status(404).send({
        success: false,
        error: error instanceof Error ? error.message : '获取数据结构详情失败',
      });
    }
  });

  // 更新数据结构
  fastify.put('/data-structures/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const result = await DataStructureService.updateDataStructure(id, request.body as any);
      return reply.send(result);
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : '更新数据结构失败',
      });
    }
  });

  // 删除数据结构
  fastify.delete('/data-structures/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const result = await DataStructureService.deleteDataStructure(id);
      return reply.send(result);
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : '删除数据结构失败',
      });
    }
  });
}
