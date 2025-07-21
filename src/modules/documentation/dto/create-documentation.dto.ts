import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsUUID, IsArray } from 'class-validator';

export enum DocType {
  OVERVIEW = 'OVERVIEW',
  TECHNICAL = 'TECHNICAL',
  DESIGN = 'DESIGN',
  RESEARCH = 'RESEARCH',
  USER_GUIDE = 'USER_GUIDE',
  API_DOC = 'API_DOC',
  OTHER = 'OTHER',
}

export enum DocumentStatus {
  DRAFT = 'DRAFT',
  REVIEWING = 'REVIEWING',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum DocumentVisibility {
  PUBLIC = 'PUBLIC',
  INTERNAL = 'INTERNAL',
  PRIVATE = 'PRIVATE',
}

export class CreateDocumentationDto {
  @ApiProperty({ description: '文档标题' })
  @IsString()
  title: string;

  @ApiProperty({ description: '文档内容' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: '摘要' })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiProperty({ description: '项目ID' })
  @IsUUID()
  projectId: string;

  @ApiPropertyOptional({ enum: DocType, default: DocType.OVERVIEW })
  @IsOptional()
  @IsEnum(DocType)
  type?: DocType;

  @ApiPropertyOptional({ enum: DocumentStatus, default: DocumentStatus.DRAFT })
  @IsOptional()
  @IsEnum(DocumentStatus)
  status?: DocumentStatus;

  @ApiPropertyOptional({ enum: DocumentVisibility, default: DocumentVisibility.INTERNAL })
  @IsOptional()
  @IsEnum(DocumentVisibility)
  visibility?: DocumentVisibility;

  @ApiPropertyOptional({ description: '分类' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: '外部文档URL' })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiPropertyOptional({ description: '版本号', default: '1.0.0' })
  @IsOptional()
  @IsString()
  version?: string;

  @ApiPropertyOptional({ description: '标签ID数组' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  tagIds?: string[];
}
