import { Module } from '@nestjs/common';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';
import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';
import { PromptTemplateController } from './prompt-template.controller';
import { PromptTemplateService } from './prompt-template.service';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '@shared/prisma/prisma.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [TeamController, AgentController, PromptTemplateController],
  providers: [TeamService, AgentService, PromptTemplateService],
  exports: [TeamService, AgentService, PromptTemplateService],
})
export class TeamModule {}
