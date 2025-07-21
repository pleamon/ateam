import { ApiProperty } from '@nestjs/swagger';
import {
  DocType,
  DocumentStatus,
  DocumentVisibility,
} from './create-documentation.dto';
import {
  RequirementType,
  RequirementPriority,
  RequirementStatus,
  RequirementSource,
} from '../../requirements/dto/create-requirement.dto';
import { KnowledgeCategory } from '../../knowledge/dto/create-domain-knowledge.dto';
import { ArchitectureStatus } from '../../architecture/dto/create-architecture.dto';
import { ApiMethod, ApiStatus } from '../../api-design/dto/create-api-design.dto';
import { DatabaseEngine } from '../../database-design/dto/create-database-structure.dto';

export class DocumentationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  content: string;

  @ApiProperty({ required: false })
  summary?: string;

  @ApiProperty({ enum: DocType })
  type: DocType;

  @ApiProperty({ enum: DocumentStatus })
  status: DocumentStatus;

  @ApiProperty({ enum: DocumentVisibility })
  visibility: DocumentVisibility;

  @ApiProperty({ required: false })
  category?: string;

  @ApiProperty({ required: false })
  url?: string;

  @ApiProperty()
  version: string;

  @ApiProperty()
  projectId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  publishedAt?: Date;

  @ApiProperty({ required: false })
  project?: {
    id: string;
    name: string;
  };

  @ApiProperty({ required: false })
  tags?: any[];

  @ApiProperty({ required: false })
  _count?: {
    DocumentComment: number;
    DocumentAttachment: number;
    DocumentVersion: number;
  };
}

export class MindMapResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty()
  overview: string;

  @ApiProperty()
  projectId: string;

  @ApiProperty({ required: false })
  theme?: any;

  @ApiProperty()
  layout: string;

  @ApiProperty()
  version: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  project?: {
    id: string;
    name: string;
  };

  @ApiProperty({ required: false })
  rootNode?: any;

  @ApiProperty({ required: false })
  _count?: {
    MindMapNode: number;
  };
}

export class RequirementResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  content: string;

  @ApiProperty({ enum: RequirementType })
  type: RequirementType;

  @ApiProperty({ enum: RequirementPriority })
  priority: RequirementPriority;

  @ApiProperty({ enum: RequirementStatus })
  status: RequirementStatus;

  @ApiProperty({ enum: RequirementSource })
  source: RequirementSource;

  @ApiProperty()
  projectId: string;

  @ApiProperty({ required: false })
  parentId?: string;

  @ApiProperty()
  version: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  project?: {
    id: string;
    name: string;
  };

  @ApiProperty({ required: false })
  _count?: {
    Requirement: number;
    RequirementQuestion: number;
    RequirementAttachment: number;
  };
}

export class DomainKnowledgeResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  domain: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ enum: KnowledgeCategory })
  category: KnowledgeCategory;

  @ApiProperty({ type: [String] })
  tags: string[];

  @ApiProperty()
  projectId: string;

  @ApiProperty()
  version: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  project?: {
    id: string;
    name: string;
  };

  @ApiProperty({ required: false })
  _count?: {
    DomainConcept: number;
    DomainPattern: number;
    DomainBestPractice: number;
    DomainAntiPattern: number;
    DomainReference: number;
  };
}

export class SystemArchitectureResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  overview: string;

  @ApiProperty()
  version: string;

  @ApiProperty({ enum: ArchitectureStatus })
  status: ArchitectureStatus;

  @ApiProperty({ type: [String] })
  platforms: string[];

  @ApiProperty({ type: [String] })
  components: string[];

  @ApiProperty({ type: [String] })
  technologies: string[];

  @ApiProperty({ required: false })
  diagrams?: string;

  @ApiProperty({ required: false })
  notes?: string;

  @ApiProperty()
  projectId: string;

  @ApiProperty()
  versionNumber: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  project?: {
    id: string;
    name: string;
  };

  @ApiProperty({ required: false })
  _count?: {
    PlatformArchitecture: number;
    ArchitectureChangeHistory: number;
  };
}

export class ApiDesignResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  apiName: string;

  @ApiProperty()
  apiPath: string;

  @ApiProperty({ enum: ApiMethod })
  apiMethod: ApiMethod;

  @ApiProperty()
  apiVersion: string;

  @ApiProperty()
  platform: string;

  @ApiProperty({ required: false })
  module?: string;

  @ApiProperty()
  apiDescription: string;

  @ApiProperty({ required: false })
  businessLogic?: string;

  @ApiProperty({ enum: ApiStatus })
  status: ApiStatus;

  @ApiProperty()
  projectId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  project?: {
    id: string;
    name: string;
  };

  @ApiProperty({ required: false })
  _count?: {
    ApiExample: number;
    ApiErrorCode: number;
  };
}

export class DatabaseSchemaResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  schemaName: string;

  @ApiProperty({ enum: DatabaseEngine })
  engine: DatabaseEngine;

  @ApiProperty()
  charset: string;

  @ApiProperty()
  collation: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty()
  projectId: string;

  @ApiProperty()
  version: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  project?: {
    id: string;
    name: string;
  };

  @ApiProperty({ required: false })
  _count?: {
    DatabaseTable: number;
  };
}
