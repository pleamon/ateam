import { Module } from '@nestjs/common';
import { DocumentationController } from './documentation.controller';
import { MindMapController } from './mindmap.controller';
import { RequirementController } from './requirement.controller';
import { DomainKnowledgeController } from './domain-knowledge.controller';
import { ArchitectureController } from './architecture.controller';
import { ApiDesignController } from './api-design.controller';
import { DatabaseStructureController } from './database-structure.controller';
import { DocumentationService } from './services/documentation.service';
import { MindMapService } from './services/mindmap.service';
import { RequirementService } from './services/requirement.service';
import { DomainKnowledgeService } from './services/domain-knowledge.service';
import { ArchitectureService } from './services/architecture.service';
import { ApiDesignService } from './services/api-design.service';
import { DatabaseStructureService } from './services/database-structure.service';
import { PrismaModule } from '@shared/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [
    DocumentationController,
    MindMapController,
    RequirementController,
    DomainKnowledgeController,
    ArchitectureController,
    ApiDesignController,
    DatabaseStructureController,
  ],
  providers: [
    DocumentationService,
    MindMapService,
    RequirementService,
    DomainKnowledgeService,
    ArchitectureService,
    ApiDesignService,
    DatabaseStructureService,
  ],
  exports: [
    DocumentationService,
    MindMapService,
    RequirementService,
    DomainKnowledgeService,
    ArchitectureService,
    ApiDesignService,
    DatabaseStructureService,
  ],
})
export class DocumentationModule {}
