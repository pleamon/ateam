import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTeamDto {
  @ApiProperty({ description: '团队名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '团队描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '项目ID' })
  @IsUUID()
  projectId: string;
}
