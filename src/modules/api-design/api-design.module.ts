import { Module } from '@nestjs/common';
import { ApiDesignController } from './api-design.controller';
import { ApiDesignService } from './api-design.service';
import { PrismaModule } from '@shared/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ApiDesignController],
  providers: [ApiDesignService],
  exports: [ApiDesignService],
})
export class ApiDesignModule {}