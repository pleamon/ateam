import { Module } from '@nestjs/common';
import { DocumentationController } from './documentation.controller';
import { MindMapController } from './mindmap.controller';
import { DocumentationService } from './services/documentation.service';
import { MindMapService } from './services/mindmap.service';
import { PrismaModule } from '@shared/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [
    DocumentationController,
    MindMapController,
  ],
  providers: [
    DocumentationService,
    MindMapService,
  ],
  exports: [
    DocumentationService,
    MindMapService,
  ],
})
export class DocumentationModule {}