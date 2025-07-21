import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProjectModule } from './modules/project/project.module';
import { TeamModule } from './modules/team/team.module';
import { ScrumModule } from './modules/scrum/scrum.module';
import { DocumentationModule } from './modules/documentation/documentation.module';
import { RoadmapModule } from './modules/roadmap/roadmap.module';
import { McpModule } from './modules/mcp/mcp.module';
import { AppController } from './app.controller';
import { PrismaModule } from './shared/prisma/prisma.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    // PrismaModule.forRoot({
    //   isGlobal: true,
    //   prismaServiceOptions: {
    //     explicitConnect: false,
    //     middlewares: [
    //       loggingMiddleware({
    //         logger: console,
    //         logLevel: 'log',
    //       })
    //     ],
    //     prismaOptions: {
    //       classNames: {
    //         PrismaClient: 'PrismaService',
    //       },
    //       log: ['warn', 'error'],
    //       datasources: {
    //         db: {
    //           url: process.env.DATABASE_URL,
    //         },
    //       },
    //     },
    //   }
    // }),
    AuthModule,
    ProjectModule,
    TeamModule,
    ScrumModule,
    DocumentationModule,
    RoadmapModule,
    McpModule,
  ],
  controllers: [AppController],
})
export class AppModule { }
