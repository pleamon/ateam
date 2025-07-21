import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePromptTemplateDto {
  @ApiProperty({ description: '模板名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '职责描述' })
  @IsString()
  responsibility: string;

  @ApiProperty({ description: '提示词内容' })
  @IsString()
  prompt: string;

  @ApiProperty({ description: '是否启用', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}

export class UpdatePromptTemplateDto {
  @ApiProperty({ description: '模板名称', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: '职责描述', required: false })
  @IsOptional()
  @IsString()
  responsibility?: string;

  @ApiProperty({ description: '提示词内容', required: false })
  @IsOptional()
  @IsString()
  prompt?: string;

  @ApiProperty({ description: '是否启用', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class PromptTemplateResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  responsibility: string;

  @ApiProperty()
  prompt: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
