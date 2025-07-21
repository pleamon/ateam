import { Module } from '@nestjs/common';
import { RequirementController } from './requirement.controller';
import { RequirementService } from './requirement.service';
import { PrismaModule } from '@shared/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [RequirementController],
  providers: [RequirementService],
  exports: [RequirementService],
})
export class RequirementsModule {}