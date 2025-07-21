import {
  Controller,
  Get,
  Post,
  Body as RequestBody,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RoadmapService } from './roadmap.service';
import {
  CreateRoadmapDto,
  CreateMilestoneDto,
  CreateVersionDto,
  CreateFeatureDto,
} from './dto/create-roadmap.dto';
import {
  UpdateRoadmapDto,
  UpdateMilestoneDto,
  UpdateVersionDto,
  UpdateFeatureDto,
} from './dto/update-roadmap.dto';
import {
  RoadmapResponseDto,
  MilestoneResponseDto,
  VersionResponseDto,
  FeatureResponseDto,
  RoadmapStatsDto,
} from './dto/roadmap-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';

@ApiTags('路线图管理')
@Controller('roadmaps')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RoadmapController {
  constructor(private readonly roadmapService: RoadmapService) {}

  @Post()
  @ApiOperation({ summary: '创建路线图' })
  @ApiResponse({ status: 201, description: '创建成功', type: RoadmapResponseDto })
  createRoadmap(
    @RequestBody() createRoadmapDto: CreateRoadmapDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.roadmapService.createRoadmap(createRoadmapDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: '获取路线图列表' })
  @ApiQuery({ name: 'projectId', required: false, description: '项目ID' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: [RoadmapResponseDto],
  })
  findAllRoadmaps(@Query('projectId') projectId?: string, @CurrentUser() user?: CurrentUserData) {
    return this.roadmapService.findAllRoadmaps(user.id, projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取路线图详情' })
  @ApiResponse({ status: 200, description: '获取成功', type: RoadmapResponseDto })
  findOneRoadmap(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.roadmapService.findOneRoadmap(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新路线图' })
  @ApiResponse({ status: 200, description: '更新成功', type: RoadmapResponseDto })
  updateRoadmap(
    @Param('id') id: string,
    @RequestBody() updateRoadmapDto: UpdateRoadmapDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.roadmapService.updateRoadmap(id, updateRoadmapDto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除路线图' })
  @ApiResponse({ status: 200, description: '删除成功' })
  removeRoadmap(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.roadmapService.removeRoadmap(id, user.id);
  }

  @Get('projects/:projectId/stats')
  @ApiOperation({ summary: '获取项目路线图统计信息' })
  @ApiResponse({ status: 200, description: '获取成功', type: RoadmapStatsDto })
  getRoadmapStats(@Param('projectId') projectId: string, @CurrentUser() user: CurrentUserData) {
    return this.roadmapService.getRoadmapStats(projectId, user.id);
  }

  // 里程碑管理
  @Post('milestones')
  @ApiOperation({ summary: '创建里程碑' })
  @ApiResponse({ status: 201, description: '创建成功', type: MilestoneResponseDto })
  createMilestone(
    @RequestBody() createMilestoneDto: CreateMilestoneDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.roadmapService.createMilestone(createMilestoneDto, user.id);
  }

  @Get('milestones')
  @ApiOperation({ summary: '获取里程碑列表' })
  @ApiQuery({ name: 'projectId', required: false, description: '项目ID' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: [MilestoneResponseDto],
  })
  findAllMilestones(@Query('projectId') projectId?: string, @CurrentUser() user?: CurrentUserData) {
    return this.roadmapService.findAllMilestones(user.id, projectId);
  }

  @Patch('milestones/:id')
  @ApiOperation({ summary: '更新里程碑' })
  @ApiResponse({ status: 200, description: '更新成功', type: MilestoneResponseDto })
  updateMilestone(
    @Param('id') id: string,
    @RequestBody() updateMilestoneDto: UpdateMilestoneDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.roadmapService.updateMilestone(id, updateMilestoneDto, user.id);
  }

  @Delete('milestones/:id')
  @ApiOperation({ summary: '删除里程碑' })
  @ApiResponse({ status: 200, description: '删除成功' })
  removeMilestone(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.roadmapService.removeMilestone(id, user.id);
  }

  // 版本管理
  @Post('versions')
  @ApiOperation({ summary: '创建版本' })
  @ApiResponse({ status: 201, description: '创建成功', type: VersionResponseDto })
  createVersion(
    @RequestBody() createVersionDto: CreateVersionDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.roadmapService.createVersion(createVersionDto, user.id);
  }

  @Get('versions')
  @ApiOperation({ summary: '获取版本列表' })
  @ApiQuery({ name: 'projectId', required: false, description: '项目ID' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: [VersionResponseDto],
  })
  findAllVersions(@Query('projectId') projectId?: string, @CurrentUser() user?: CurrentUserData) {
    return this.roadmapService.findAllVersions(user.id, projectId);
  }

  @Patch('versions/:id')
  @ApiOperation({ summary: '更新版本' })
  @ApiResponse({ status: 200, description: '更新成功', type: VersionResponseDto })
  updateVersion(
    @Param('id') id: string,
    @RequestBody() updateVersionDto: UpdateVersionDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.roadmapService.updateVersion(id, updateVersionDto, user.id);
  }

  @Delete('versions/:id')
  @ApiOperation({ summary: '删除版本' })
  @ApiResponse({ status: 200, description: '删除成功' })
  removeVersion(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.roadmapService.removeVersion(id, user.id);
  }

  // 功能管理
  @Post('features')
  @ApiOperation({ summary: '创建功能' })
  @ApiResponse({ status: 201, description: '创建成功', type: FeatureResponseDto })
  createFeature(
    @RequestBody() createFeatureDto: CreateFeatureDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.roadmapService.createFeature(createFeatureDto, user.id);
  }

  @Patch('features/:id')
  @ApiOperation({ summary: '更新功能' })
  @ApiResponse({ status: 200, description: '更新成功', type: FeatureResponseDto })
  updateFeature(
    @Param('id') id: string,
    @RequestBody() updateFeatureDto: UpdateFeatureDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.roadmapService.updateFeature(id, updateFeatureDto, user.id);
  }

  @Delete('features/:id')
  @ApiOperation({ summary: '删除功能' })
  @ApiResponse({ status: 200, description: '删除成功' })
  removeFeature(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.roadmapService.removeFeature(id, user.id);
  }
}
