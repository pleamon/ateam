import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsUUID, IsArray, IsObject } from 'class-validator';

export enum ArchitectureStatus {
  DRAFT = 'DRAFT',
  REVIEWING = 'REVIEWING',
  APPROVED = 'APPROVED',
  DEPRECATED = 'DEPRECATED',
}

export class CreateSystemArchitectureDto {
  @ApiProperty({ description: '架构名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '技术架构总览' })
  @IsString()
  overview: string;

  @ApiProperty({ description: '项目ID' })
  @IsUUID()
  projectId: string;

  @ApiPropertyOptional({ description: '版本号', default: '1.0.0' })
  @IsOptional()
  @IsString()
  version?: string;

  @ApiPropertyOptional({ enum: ArchitectureStatus, default: ArchitectureStatus.DRAFT })
  @IsOptional()
  @IsEnum(ArchitectureStatus)
  status?: ArchitectureStatus;

  @ApiPropertyOptional({ description: '支持的平台', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  platforms?: string[];

  @ApiPropertyOptional({ description: '主要组件', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  components?: string[];

  @ApiPropertyOptional({ description: '关键技术栈', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  technologies?: string[];

  @ApiPropertyOptional({ description: '架构图（URL或Base64）' })
  @IsOptional()
  @IsString()
  diagrams?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreatePlatformArchitectureDto {
  @ApiProperty({ description: '平台名称' })
  @IsString()
  platform: string;

  @ApiProperty({ description: '显示名称' })
  @IsString()
  displayName: string;

  @ApiProperty({ description: '平台架构描述' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ description: '前端架构描述' })
  @IsOptional()
  @IsObject()
  frontend?: any;

  @ApiPropertyOptional({ description: '后端架构描述' })
  @IsOptional()
  @IsObject()
  backend?: any;

  @ApiPropertyOptional({ description: '基础设施描述' })
  @IsOptional()
  @IsObject()
  infrastructure?: any;

  @ApiPropertyOptional({ description: '该平台的关键技术栈', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  technologies?: string[];

  @ApiPropertyOptional({ description: '该平台的主要组件', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  components?: string[];

  @ApiPropertyOptional({ description: '依赖关系' })
  @IsOptional()
  @IsObject()
  dependencies?: any;

  @ApiPropertyOptional({ description: '部署策略' })
  @IsOptional()
  @IsString()
  deploymentStrategy?: string;

  @ApiPropertyOptional({ description: '扩展策略' })
  @IsOptional()
  @IsString()
  scalingStrategy?: string;

  @ApiPropertyOptional({ description: '该平台的架构图' })
  @IsOptional()
  @IsString()
  diagrams?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  notes?: string;
}
