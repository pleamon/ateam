import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import { AuthService } from '../services/auth/auth.service';
import { PermissionService, Permission } from '../services/auth/permission.service';

declare module 'fastify' {
    interface FastifyRequest {
        userId?: string;
        user?: {
            id: string;
            email: string;
            username: string;
            role: string;
        };
    }
}

export interface AuthOptions {
    excludePaths?: string[]; // 不需要认证的路径
}

async function authPlugin(fastify: FastifyInstance, options: AuthOptions) {
    const excludePaths = options.excludePaths || [
        '/api/auth/register',
        '/api/auth/login',
        '/api/health',
    ];

    // 认证中间件
    fastify.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
        // 检查是否是排除的路径
        if (excludePaths.some(path => request.url.startsWith(path))) {
            return;
        }

        // 获取 token
        const token = AuthService.getTokenFromRequest(request);
        if (!token) {
            reply.code(401).send({
                success: false,
                message: '未授权访问',
            });
            return;
        }

        // 验证 token
        const userId = await AuthService.verifyToken(token);
        if (!userId) {
            reply.code(401).send({
                success: false,
                message: 'Token 无效或已过期',
            });
            return;
        }

        // 设置用户信息
        request.userId = userId;
    });

    // 装饰器：获取当前用户
    fastify.decorate('getCurrentUser', async function (request: FastifyRequest) {
        if (!request.userId) {
            return null;
        }

        if (!request.user) {
            const result = await AuthService.getCurrentUser(request.userId);
            request.user = result.data;
        }

        return request.user;
    });

    // 装饰器：检查权限
    fastify.decorate('requirePermission', function (permission: Permission, getProjectId?: (request: FastifyRequest) => string) {
        return async function (request: FastifyRequest, reply: FastifyReply) {
            if (!request.userId) {
                reply.code(401).send({
                    success: false,
                    message: '未授权访问',
                });
                return;
            }

            const projectId = getProjectId ? getProjectId(request) : undefined;
            const hasPermission = await PermissionService.checkPermission(
                request.userId,
                permission,
                projectId
            );

            if (!hasPermission) {
                reply.code(403).send({
                    success: false,
                    message: '没有权限执行此操作',
                });
                return;
            }
        };
    });

    // 装饰器：检查项目成员
    fastify.decorate('requireProjectMember', function (getProjectId: (request: FastifyRequest) => string) {
        return async function (request: FastifyRequest, reply: FastifyReply) {
            if (!request.userId) {
                reply.code(401).send({
                    success: false,
                    message: '未授权访问',
                });
                return;
            }

            const projectId = getProjectId(request);
            const isMember = await PermissionService.isProjectMember(request.userId, projectId);

            if (!isMember) {
                reply.code(403).send({
                    success: false,
                    message: '您不是该项目的成员',
                });
                return;
            }
        };
    });
}

declare module 'fastify' {
    interface FastifyInstance {
        getCurrentUser: (request: FastifyRequest) => Promise<any>;
        requirePermission: (
            permission: Permission,
            getProjectId?: (request: FastifyRequest) => string
        ) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
        requireProjectMember: (
            getProjectId: (request: FastifyRequest) => string
        ) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    }
}

export default fp(authPlugin, {
    name: 'auth',
});