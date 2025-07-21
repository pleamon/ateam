import { Module } from '@nestjs/common';
import { SprintController } from './sprint.controller';
import { SprintService } from './sprint.service';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { PrismaModule } from '@shared/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [SprintController, TaskController],
  providers: [SprintService, TaskService],
  exports: [SprintService, TaskService],
})
export class ScrumModule {}
