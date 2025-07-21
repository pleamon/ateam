import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProjectModule } from './modules/project/project.module';
import { TeamModule } from './modules/team/team.module';
import { ScrumModule } from './modules/scrum/scrum.module';
import { DocumentationModule } from './modules/documentation/documentation.module';
import { ApiDesignModule } from './modules/api-design/api-design.module';
import { ArchitectureModule } from './modules/architecture/architecture.module';
import { DatabaseDesignModule } from './modules/database-design/database-design.module';
import { KnowledgeModule } from './modules/knowledge/knowledge.module';
import { RequirementsModule } from './modules/requirements/requirements.module';
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
    ApiDesignModule,
    ArchitectureModule,
    DatabaseDesignModule,
    KnowledgeModule,
    RequirementsModule,
    RoadmapModule,
    McpModule,
  ],
  controllers: [AppController],
})
export class AppModule { }
