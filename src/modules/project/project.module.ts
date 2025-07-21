import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '@shared/prisma/prisma.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}
