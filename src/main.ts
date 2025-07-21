import 'reflect-metadata';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
// import { PrismaClient } from '../generated/prisma';
// import { PrismaPg } from '@prisma/adapter-pg';

// 导入插件
import authPlugin from './plugins/auth.plugin';

// 导入路由
import authRoutes from './routes/auth.route';
import projectRoutes from './routes/project';
import teamRoutes from './routes/team/team';
import teamMemberRoutes from './routes/team/team-member';
import promptTemplateRoutes from './routes/team/prompt-template';
import taskRoutes from './routes/task';
import sprintRoutes from './routes/sprint';
import documentationRoutes from './routes/documentation';
import dashboardRoutes from './routes/dashboard';
import roadmapRoutes from './routes/roadmap';
import mcpRoutes from './routes/mcp';
import permissionsRoutes from './routes/auth/permissions.routes';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );
  
  // 启用 CORS
  app.enableCors({
    origin: true,
  });
  
  // 设置全局前缀
  app.setGlobalPrefix('api');
  
  // 设置全局异常过滤器
  app.useGlobalFilters(new AllExceptionsFilter());
  
  await app.listen(3000, '0.0.0.0');
  console.log('🚀 服务器运行在 http://localhost:3000');
  console.log('📚 API文档: http://localhost:3000/docs');
}

bootstrap().catch((err) => {
  console.error('启动失败:', err);
  process.exit(1);
});

// 启动服务器
// const start = async () => {
//   try {
//     // 注册插件
//     await fastify.register(cors, {
//       origin: true,
//     });

//     await fastify.register(helmet);

//     // Swagger配置
//     await fastify.register(swagger, {
//       swagger: {
//         info: {
//           title: 'ATeam API',
//           description: '项目管理MCP工具API文档',
//           version: '1.0.0',
//         },
//         host: 'localhost:3000',
//         schemes: ['http'],
//         consumes: ['application/json'],
//         produces: ['application/json'],
//       },
//     });

//     await fastify.register(swaggerUi, {
//       routePrefix: '/docs',
//     });

//     // 注册认证插件
//     await fastify.register(authPlugin, {
//       excludePaths: [
//         '/api/auth/register',
//         '/api/auth/login',
//         '/api/health',
//         '/health',
//         '/',
//         '/docs',
//         '/api/mcp', // MCP 端点暂时不需要认证
//         '/api/mcp/info',
//         '/api/mcp/tools',
//         '/api/demo', // 演示端点不需要认证
//       ],
//     });

//     // 注册路由
//     await fastify.register(authRoutes, { prefix: '/api/auth' });
//     await fastify.register(projectRoutes, { prefix: '/api' });
//     await fastify.register(teamRoutes, { prefix: '/api' });
//     await fastify.register(teamMemberRoutes, { prefix: '/api' });
//     await fastify.register(promptTemplateRoutes, { prefix: '/api' });
//     await fastify.register(taskRoutes, { prefix: '/api' });
//     await fastify.register(sprintRoutes, { prefix: '/api' });
//     await fastify.register(documentationRoutes, { prefix: '/api' });
//     await fastify.register(dashboardRoutes, { prefix: '/api' });
//     await fastify.register(roadmapRoutes, { prefix: '/api' });
//     await fastify.register(mcpRoutes, { prefix: '/api' });
//     await fastify.register(permissionsRoutes, { prefix: '/api' });

//     // 健康检查
//     fastify.get('/health', async () => ({
//       status: 'ok',
//       timestamp: new Date().toISOString(),
//     }));

//     // 根路径
//     fastify.get('/', async () => ({
//       message: 'ATeam项目管理API',
//       version: '1.0.0',
//       docs: '/docs',
//     }));

//     await fastify.listen({ port: 3000, host: '0.0.0.0' });
//     fastify.log.info('🚀 服务器运行在 http://localhost:3000');
//     fastify.log.info('📚 API文档: http://localhost:3000/docs');
//     fastify.log.info('🤖 MCP HTTP 端点: http://localhost:3000/api/mcp');
//     fastify.log.info('   - 工具列表: http://localhost:3000/api/mcp/tools');
//     fastify.log.info('   - JSON-RPC: http://localhost:3000/api/mcp');
//     fastify.log.info('🎯 演示端点: http://localhost:3000/api/demo');
//     fastify.log.info('   - 启动演示: POST /api/demo/start');
//     fastify.log.info('   - 模拟工作流: POST /api/demo/simulate-workflow');
//   } catch (err) {
//     fastify.log.error(err);
//     process.exit(1);
//   }
// };

// void start();
