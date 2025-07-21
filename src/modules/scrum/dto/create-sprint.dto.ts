import { IsString, IsOptional, IsUUID, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum SprintStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
}

export class CreateSprintDto {
  @ApiProperty({ description: 'Sprint名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '开始日期' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: '结束日期' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ description: 'Sprint目标', required: false })
  @IsOptional()
  @IsString()
  goal?: string;

  @ApiProperty({ description: '项目ID' })
  @IsUUID()
  projectId: string;

  @ApiProperty({
    description: '状态',
    enum: SprintStatus,
    default: SprintStatus.TODO,
    required: false,
  })
  @IsOptional()
  @IsEnum(SprintStatus)
  status?: SprintStatus;
}
