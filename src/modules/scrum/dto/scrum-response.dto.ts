import { ApiProperty } from '@nestjs/swagger';
import { SprintStatus } from './create-sprint.dto';
import { TaskStatus } from './create-task.dto';

export class SprintResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  startDate: Date;

  @ApiProperty()
  endDate: Date;

  @ApiProperty({ required: false })
  goal?: string;

  @ApiProperty({ enum: SprintStatus })
  status: SprintStatus;

  @ApiProperty()
  projectId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  _count?: {
    Task: number;
  };
}

export class TaskResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ required: false })
  content?: string;

  @ApiProperty({ enum: TaskStatus })
  status: TaskStatus;

  @ApiProperty({ required: false })
  dueDate?: Date;

  @ApiProperty()
  projectId: string;

  @ApiProperty({ required: false })
  sprintId?: string;

  @ApiProperty({ required: false })
  teamId?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  _count?: {
    AgentTask: number;
    TaskActivity: number;
  };
}

export class SprintStatsDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  todo: number;

  @ApiProperty()
  inProgress: number;

  @ApiProperty()
  done: number;
}

export class TaskStatsDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  todo: number;

  @ApiProperty()
  inProgress: number;

  @ApiProperty()
  testing: number;

  @ApiProperty()
  done: number;
}
