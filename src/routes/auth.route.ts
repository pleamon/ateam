import { FastifyInstance } from 'fastify';
import { AuthService } from '../services/auth/auth.service';
import { PermissionService } from '../services/auth/permission.service';
import { RegisterRequest, LoginRequest } from '../types/request.types';

export default async function authRoutes(fastify: FastifyInstance) {
  // 用户注册
  fastify.post<{ Body: RegisterRequest }>('/register', async (request, reply) => {
    try {
      const result = await AuthService.register(request.body);
      reply.send(result);
    } catch (error) {
      reply.code(400).send({
        success: false,
        message: error instanceof Error ? error.message : '注册失败',
      });
    }
  });

  // 用户登录
  fastify.post<{ Body: LoginRequest }>('/login', async (request, reply) => {
    try {
      const result = await AuthService.login(request.body);

      // 记录审计日志
      await PermissionService.createAuditLog(
        result.data.user.id,
        'LOGIN',
        'USER',
        result.data.user.id,
        {
          ip: request.ip,
          userAgent: request.headers['user-agent'],
        },
      );

      reply.send(result);
    } catch (error) {
      reply.code(400).send({
        success: false,
        message: error instanceof Error ? error.message : '登录失败',
      });
    }
  });

  // 退出登录
  fastify.post('/logout', async (request, reply) => {
    try {
      const token = AuthService.getTokenFromRequest(request);
      if (token) {
        await AuthService.logout(token);
      }

      reply.send({
        success: true,
        message: '退出成功',
      });
    } catch (error: any) {
      reply.code(400).send({
        success: false,
        message: error.message,
      });
    }
  });

  // 获取当前用户信息
  fastify.get('/me', async (request, reply) => {
    try {
      if (!request.userId) {
        reply.code(401).send({
          success: false,
          message: '未授权访问',
        });
        return;
      }

      const result = await AuthService.getCurrentUser(request.userId);
      reply.send(result);
    } catch (error: any) {
      reply.code(400).send({
        success: false,
        message: error.message,
      });
    }
  });

  // 获取用户权限
  fastify.get('/permissions', async (request, reply) => {
    try {
      if (!request.userId) {
        reply.code(401).send({
          success: false,
          message: '未授权访问',
        });
        return;
      }

      const { projectId } = request.query as { projectId?: string };
      const permissions = await PermissionService.getUserPermissions(request.userId, projectId);

      reply.send({
        success: true,
        data: permissions,
      });
    } catch (error: any) {
      reply.code(400).send({
        success: false,
        message: error.message,
      });
    }
  });

  // 刷新 token（可选功能）
  fastify.post('/refresh', async (request, reply) => {
    // TODO: 实现 token 刷新逻辑
    reply.code(501).send({
      success: false,
      message: '功能尚未实现',
    });
  });
}
