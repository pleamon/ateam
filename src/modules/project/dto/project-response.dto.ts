import { ApiProperty } from '@nestjs/swagger';
import { ProjectRole } from '@generated/prisma';

export class ProjectMemberDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  projectId: string;

  @ApiProperty({ enum: ProjectRole })
  role: ProjectRole;

  @ApiProperty({ type: [String] })
  permissions: string[];

  @ApiProperty()
  joinedAt: Date;
}

export class ProjectResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty()
  createdBy: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: [ProjectMemberDto], required: false })
  members?: ProjectMemberDto[];

  @ApiProperty({ required: false })
  _count?: {
    tasks: number;
    sprints: number;
    documentations: number;
    requirements: number;
    teams: number;
  };
}

export class ProjectStatsDto {
  @ApiProperty()
  totalTasks: number;

  @ApiProperty()
  totalSprints: number;

  @ApiProperty()
  totalDocuments: number;

  @ApiProperty()
  totalRequirements: number;

  @ApiProperty()
  totalTeams: number;

  @ApiProperty()
  totalMembers: number;
}
