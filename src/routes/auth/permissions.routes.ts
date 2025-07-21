import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ServiceAdapter } from '../../mcp/service-adapter';

// 权限管理路由 - 支持MCP工具定义的格式
export default async function permissionsRoutes(fastify: FastifyInstance) {
  // 获取用户在项目中的权限
  fastify.get('/v2/users/:userId/projects/:projectId/permissions', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { userId, projectId } = request.params as { userId: string; projectId: string };
      const result = await ServiceAdapter.getUserProjectPermissions(userId, projectId);
      return reply.send(result);
    } catch (error) {
      return reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : '获取用户权限失败',
      });
    }
  });

  // 分配项目角色给用户
  fastify.post('/v2/project-roles', {
    schema: {
      body: {
        type: 'object',
        required: ['userId', 'projectId', 'role'],
        properties: {
          userId: { type: 'string' },
          projectId: { type: 'string' },
          role: {
            type: 'string',
            enum: ['owner', 'admin', 'member', 'viewer']
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { userId, projectId, role } = request.body as any;
      const result = await ServiceAdapter.assignProjectRole(userId, projectId, role);
      return reply.status(201).send(result);
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : '分配角色失败',
      });
    }
  });
}