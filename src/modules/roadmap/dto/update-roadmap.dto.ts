import { PartialType } from '@nestjs/swagger';
import {
  CreateRoadmapDto,
  CreateMilestoneDto,
  CreateVersionDto,
  CreateFeatureDto,
} from './create-roadmap.dto';

export class UpdateRoadmapDto extends PartialType(CreateRoadmapDto) {}

export class UpdateMilestoneDto extends PartialType(CreateMilestoneDto) {}

export class UpdateVersionDto extends PartialType(CreateVersionDto) {}

export class UpdateFeatureDto extends PartialType(CreateFeatureDto) {}
