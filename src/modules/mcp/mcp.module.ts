import { Module } from '@nestjs/common';
import { McpController } from './mcp.controller';
import { McpService } from './mcp.service';
import { ProjectModule } from '../project/project.module';
import { TeamModule } from '../team/team.module';
import { ScrumModule } from '../scrum/scrum.module';
import { DocumentationModule } from '../documentation/documentation.module';
import { RoadmapModule } from '../roadmap/roadmap.module';
import { PrismaModule } from '@shared/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule, ProjectModule, TeamModule, ScrumModule, DocumentationModule, RoadmapModule],
  controllers: [McpController],
  providers: [McpService],
  exports: [McpService],
})
export class McpModule {}
