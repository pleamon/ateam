import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsObject, IsEnum } from 'class-validator';

export enum NodeType {
  ROOT = 'ROOT',
  TOPIC = 'TOPIC',
  SUBTOPIC = 'SUBTOPIC',
  DETAIL = 'DETAIL',
  REFERENCE = 'REFERENCE',
}

export class CreateMindMapDto {
  @ApiProperty({ description: '思维导图标题' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: '描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '概览说明' })
  @IsString()
  overview: string;

  @ApiProperty({ description: '项目ID' })
  @IsUUID()
  projectId: string;

  @ApiPropertyOptional({ description: '主题配置' })
  @IsOptional()
  @IsObject()
  theme?: any;

  @ApiPropertyOptional({ description: '布局方式', default: 'tree' })
  @IsOptional()
  @IsString()
  layout?: string;
}

export class CreateMindMapNodeDto {
  @ApiProperty({ description: '节点文本' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({ enum: NodeType, default: NodeType.TOPIC })
  @IsOptional()
  @IsEnum(NodeType)
  nodeType?: NodeType;

  @ApiPropertyOptional({ description: '父节点ID' })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiProperty({ description: '同级排序' })
  position: number;

  @ApiPropertyOptional({ description: '节点样式' })
  @IsOptional()
  @IsObject()
  style?: any;

  @ApiPropertyOptional({ description: '链接' })
  @IsOptional()
  @IsString()
  link?: string;

  @ApiPropertyOptional({ description: '图标' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ description: '优先级' })
  @IsOptional()
  priority?: number;

  @ApiPropertyOptional({ description: '进度（0-100）' })
  @IsOptional()
  progress?: number;
}
