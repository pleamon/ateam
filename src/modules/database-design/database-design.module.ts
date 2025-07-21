import { Module } from '@nestjs/common';
import { DatabaseStructureController } from './database-structure.controller';
import { DatabaseStructureService } from './database-structure.service';
import { PrismaModule } from '@shared/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [DatabaseStructureController],
  providers: [DatabaseStructureService],
  exports: [DatabaseStructureService],
})
export class DatabaseDesignModule {}