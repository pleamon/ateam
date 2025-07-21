import { ApiProperty } from '@nestjs/swagger';

export class AgentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ required: false })
  workPrompt?: string;

  @ApiProperty({ type: [String] })
  responsibilities: string[];

  @ApiProperty({ type: [String] })
  skills: string[];

  @ApiProperty()
  projectId: string;

  @ApiProperty()
  teamId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class TeamResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty()
  projectId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: [AgentResponseDto], required: false })
  agents?: AgentResponseDto[];

  @ApiProperty({ required: false })
  _count?: {
    agents: number;
    tasks: number;
  };
}

export class TeamStatsDto {
  @ApiProperty()
  totalAgents: number;

  @ApiProperty()
  totalTasks: number;

  @ApiProperty()
  totalWorkLogs: number;

  @ApiProperty()
  totalActivities: number;
}
