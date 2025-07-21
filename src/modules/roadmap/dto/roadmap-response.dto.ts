import { ApiProperty } from '@nestjs/swagger';
import {
  RoadmapStatus,
  MilestoneStatus,
  VersionStatus,
  FeatureStatus,
  Priority,
} from './create-roadmap.dto';

export class RoadmapResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty()
  projectId: string;

  @ApiProperty()
  startDate: Date;

  @ApiProperty()
  endDate: Date;

  @ApiProperty({ enum: RoadmapStatus })
  status: RoadmapStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  project?: {
    id: string;
    name: string;
  };

  @ApiProperty({ required: false })
  _count?: {
    Milestone: number;
    Version: number;
  };
}

export class MilestoneResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty()
  roadmapId: string;

  @ApiProperty()
  targetDate: Date;

  @ApiProperty({ enum: MilestoneStatus })
  status: MilestoneStatus;

  @ApiProperty({ enum: Priority })
  priority: Priority;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  roadmap?: {
    id: string;
    name: string;
  };

  @ApiProperty({ required: false })
  _count?: {
    Feature: number;
  };
}

export class VersionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty()
  roadmapId: string;

  @ApiProperty({ required: false })
  releaseDate?: Date;

  @ApiProperty({ enum: VersionStatus })
  status: VersionStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  roadmap?: {
    id: string;
    name: string;
  };

  @ApiProperty({ required: false })
  _count?: {
    Feature: number;
  };
}

export class FeatureResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ required: false })
  milestoneId?: string;

  @ApiProperty({ required: false })
  versionId?: string;

  @ApiProperty({ enum: FeatureStatus })
  status: FeatureStatus;

  @ApiProperty({ enum: Priority })
  priority: Priority;

  @ApiProperty({ required: false })
  effort?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  milestone?: {
    id: string;
    name: string;
  };

  @ApiProperty({ required: false })
  version?: {
    id: string;
    name: string;
  };

  @ApiProperty({ required: false })
  _count?: {
    Task: number;
  };
}

export class RoadmapStatsDto {
  @ApiProperty()
  totalRoadmaps: number;

  @ApiProperty()
  totalMilestones: number;

  @ApiProperty()
  totalVersions: number;

  @ApiProperty()
  totalFeatures: number;

  @ApiProperty()
  milestonesByStatus: {
    planned: number;
    inProgress: number;
    completed: number;
    delayed: number;
  };

  @ApiProperty()
  featuresByStatus: {
    planned: number;
    inDevelopment: number;
    testing: number;
    completed: number;
    cancelled: number;
  };

  @ApiProperty()
  versionsByStatus: {
    planned: number;
    inDevelopment: number;
    testing: number;
    released: number;
    deprecated: number;
  };
}
