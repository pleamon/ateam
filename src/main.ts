import 'module-alias/register';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { ValidationPipe } from './common/pipes/validation.pipe';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: {
        level: process.env.LOG_LEVEL || 'info',
      },
    }),
  );

  const configService = app.get(ConfigService);

  // 启用 CORS
  app.enableCors(configService.get('cors'));

  // 设置全局前缀
  app.setGlobalPrefix('api');

  // 设置全局过滤器、管道和拦截器
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new LoggingInterceptor(), new ResponseInterceptor());

  // 配置 Swagger (暂时禁用)
  // const swaggerConfig = configService.get('swagger');
  // const config = new DocumentBuilder()
  //   .setTitle(swaggerConfig.title)
  //   .setDescription(swaggerConfig.description)
  //   .setVersion(swaggerConfig.version)
  //   .addBearerAuth()
  //   .build();
  // const document = SwaggerModule.createDocument(app, config);
  // SwaggerModule.setup(swaggerConfig.path, app, document);

  const port = configService.get<number>('port');
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 服务器运行在 http://localhost:${port}`);
  console.log(`📚 API文档: http://localhost:${port}/docs`);
}

bootstrap().catch((err) => {
  console.error('启动失败:', err);
  process.exit(1);
});
