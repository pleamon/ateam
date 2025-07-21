import { IsString, IsOptional, IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAgentDto {
  @ApiProperty({ description: 'Agent名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Agent描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '工作提示词', required: false })
  @IsOptional()
  @IsString()
  workPrompt?: string;

  @ApiProperty({ description: '职责列表', type: [String] })
  @IsArray()
  @IsString({ each: true })
  responsibilities: string[];

  @ApiProperty({ description: '技能列表', type: [String] })
  @IsArray()
  @IsString({ each: true })
  skills: string[];

  @ApiProperty({ description: '团队ID' })
  @IsUUID()
  teamId: string;
}
