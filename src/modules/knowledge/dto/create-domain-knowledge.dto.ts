import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsUUID, IsArray } from 'class-validator';

export enum KnowledgeCategory {
  BUSINESS = 'BUSINESS',
  TECHNICAL = 'TECHNICAL',
  DOMAIN_SPECIFIC = 'DOMAIN_SPECIFIC',
  GENERAL = 'GENERAL',
}

export class CreateDomainKnowledgeDto {
  @ApiProperty({ description: '领域名称' })
  @IsString()
  domain: string;

  @ApiProperty({ description: '领域描述' })
  @IsString()
  description: string;

  @ApiProperty({ description: '项目ID' })
  @IsUUID()
  projectId: string;

  @ApiProperty({ enum: KnowledgeCategory })
  @IsEnum(KnowledgeCategory)
  category: KnowledgeCategory;

  @ApiPropertyOptional({ description: '标签数组' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class CreateDomainConceptDto {
  @ApiProperty({ description: '概念名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '概念定义' })
  @IsString()
  definition: string;

  @ApiPropertyOptional({ description: '示例', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  examples?: string[];

  @ApiPropertyOptional({ description: '相关概念', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  relatedConcepts?: string[];
}

export class CreateDomainPatternDto {
  @ApiProperty({ description: '模式名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '模式描述' })
  @IsString()
  description: string;

  @ApiProperty({ description: '适用场景' })
  @IsString()
  context: string;

  @ApiProperty({ description: '解决方案' })
  @IsString()
  solution: string;

  @ApiProperty({ description: '结果影响' })
  @IsString()
  consequences: string;

  @ApiPropertyOptional({ description: '示例', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  examples?: string[];
}

export class CreateDomainBestPracticeDto {
  @ApiProperty({ description: '最佳实践标题' })
  @IsString()
  title: string;

  @ApiProperty({ description: '描述' })
  @IsString()
  description: string;

  @ApiProperty({ description: '原理说明' })
  @IsString()
  rationale: string;

  @ApiProperty({ description: '实施方法' })
  @IsString()
  implementation: string;

  @ApiPropertyOptional({ description: '好处', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  benefits?: string[];

  @ApiPropertyOptional({ description: '注意事项', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  considerations?: string[];
}
