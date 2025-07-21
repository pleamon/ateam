import { IsString, IsOptional, IsUUID, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  TESTING = 'testing',
  DONE = 'done',
}

export class CreateTaskDto {
  @ApiProperty({ description: '任务标题' })
  @IsString()
  title: string;

  @ApiProperty({ description: '任务内容', required: false })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ description: '项目ID' })
  @IsUUID()
  projectId: string;

  @ApiProperty({ description: 'SprintID', required: false })
  @IsOptional()
  @IsUUID()
  sprintId?: string;

  @ApiProperty({ description: '团队ID', required: false })
  @IsOptional()
  @IsUUID()
  teamId?: string;

  @ApiProperty({ description: '截止日期', required: false })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({
    description: '状态',
    enum: TaskStatus,
    default: TaskStatus.TODO,
    required: false,
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;
}
