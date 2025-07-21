import { Module } from '@nestjs/common';
import { ArchitectureController } from './architecture.controller';
import { ArchitectureService } from './architecture.service';
import { PrismaModule } from '@shared/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ArchitectureController],
  providers: [ArchitectureService],
  exports: [ArchitectureService],
})
export class ArchitectureModule {}