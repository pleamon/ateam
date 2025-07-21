import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsUUID } from 'class-validator';

export enum RequirementType {
  FUNCTIONAL = 'FUNCTIONAL',
  NON_FUNCTIONAL = 'NON_FUNCTIONAL',
  BUSINESS = 'BUSINESS',
  TECHNICAL = 'TECHNICAL',
}

export enum RequirementPriority {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export enum RequirementStatus {
  DRAFT = 'DRAFT',
  REVIEWING = 'REVIEWING',
  CONFIRMED = 'CONFIRMED',
  IMPLEMENTED = 'IMPLEMENTED',
  DEPRECATED = 'DEPRECATED',
}

export enum RequirementSource {
  CUSTOMER = 'CUSTOMER',
  PRODUCT = 'PRODUCT',
  TECHNICAL = 'TECHNICAL',
  INTERNAL = 'INTERNAL',
}

export class CreateRequirementDto {
  @ApiProperty({ description: '需求标题' })
  @IsString()
  title: string;

  @ApiProperty({ description: '需求详细内容' })
  @IsString()
  content: string;

  @ApiProperty({ description: '项目ID' })
  @IsUUID()
  projectId: string;

  @ApiProperty({ enum: RequirementType })
  @IsEnum(RequirementType)
  type: RequirementType;

  @ApiProperty({ enum: RequirementPriority })
  @IsEnum(RequirementPriority)
  priority: RequirementPriority;

  @ApiPropertyOptional({ enum: RequirementStatus, default: RequirementStatus.DRAFT })
  @IsOptional()
  @IsEnum(RequirementStatus)
  status?: RequirementStatus;

  @ApiProperty({ enum: RequirementSource })
  @IsEnum(RequirementSource)
  source: RequirementSource;

  @ApiPropertyOptional({ description: '父需求ID' })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}

export enum QuestionStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export enum QuestionPriority {
  URGENT = 'URGENT',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export class CreateRequirementQuestionDto {
  @ApiProperty({ description: '问题内容' })
  @IsString()
  question: string;

  @ApiPropertyOptional({ description: '答案' })
  @IsOptional()
  @IsString()
  answer?: string;

  @ApiPropertyOptional({ enum: QuestionStatus, default: QuestionStatus.TODO })
  @IsOptional()
  @IsEnum(QuestionStatus)
  status?: QuestionStatus;

  @ApiPropertyOptional({ enum: QuestionPriority, default: QuestionPriority.MEDIUM })
  @IsOptional()
  @IsEnum(QuestionPriority)
  priority?: QuestionPriority;

  @ApiProperty({ description: '关联agentID' })
  @IsUUID()
  agentId: string;
}
