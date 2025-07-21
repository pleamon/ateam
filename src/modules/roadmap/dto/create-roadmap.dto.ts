import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsDateString, IsEnum } from 'class-validator';

export enum RoadmapStatus {
  PLANNING = 'planning',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum MilestoneStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  DELAYED = 'delayed',
}

export enum VersionStatus {
  PLANNED = 'planned',
  IN_DEVELOPMENT = 'in_development',
  TESTING = 'testing',
  RELEASED = 'released',
  DEPRECATED = 'deprecated',
}

export enum FeatureStatus {
  PLANNED = 'planned',
  IN_DEVELOPMENT = 'in_development',
  TESTING = 'testing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export class CreateRoadmapDto {
  @ApiProperty({ description: '路线图名称' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: '路线图描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '项目ID' })
  @IsUUID()
  projectId: string;

  @ApiProperty({ description: '开始日期' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: '结束日期' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ enum: RoadmapStatus, default: RoadmapStatus.PLANNING })
  @IsOptional()
  @IsEnum(RoadmapStatus)
  status?: RoadmapStatus;
}

export class CreateMilestoneDto {
  @ApiProperty({ description: '里程碑名称' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: '里程碑描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '路线图ID' })
  @IsUUID()
  roadmapId: string;

  @ApiProperty({ description: '目标日期' })
  @IsDateString()
  targetDate: string;

  @ApiPropertyOptional({ enum: MilestoneStatus, default: MilestoneStatus.PLANNED })
  @IsOptional()
  @IsEnum(MilestoneStatus)
  status?: MilestoneStatus;

  @ApiPropertyOptional({ enum: Priority, default: Priority.MEDIUM })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;
}

export class CreateVersionDto {
  @ApiProperty({ description: '版本名称', example: 'v1.0.0' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: '版本描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '路线图ID' })
  @IsUUID()
  roadmapId: string;

  @ApiPropertyOptional({ description: '发布日期' })
  @IsOptional()
  @IsDateString()
  releaseDate?: string;

  @ApiPropertyOptional({ enum: VersionStatus, default: VersionStatus.PLANNED })
  @IsOptional()
  @IsEnum(VersionStatus)
  status?: VersionStatus;
}

export class CreateFeatureDto {
  @ApiProperty({ description: '功能名称' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: '功能描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '里程碑ID' })
  @IsOptional()
  @IsUUID()
  milestoneId?: string;

  @ApiPropertyOptional({ description: '版本ID' })
  @IsOptional()
  @IsUUID()
  versionId?: string;

  @ApiPropertyOptional({ enum: FeatureStatus, default: FeatureStatus.PLANNED })
  @IsOptional()
  @IsEnum(FeatureStatus)
  status?: FeatureStatus;

  @ApiPropertyOptional({ enum: Priority, default: Priority.MEDIUM })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @ApiPropertyOptional({ description: '工作量估算' })
  @IsOptional()
  @IsString()
  effort?: string;
}
