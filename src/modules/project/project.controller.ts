import {
  Controller,
  Get,
  Post,
  Body as RequestBody,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectResponseDto, ProjectStatsDto } from './dto/project-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';

@ApiTags('项目管理')
@Controller('projects')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @ApiOperation({ summary: '创建项目' })
  @ApiResponse({ status: 201, description: '创建成功', type: ProjectResponseDto })
  @ApiResponse({ status: 400, description: '参数错误' })
  create(@RequestBody() createProjectDto: CreateProjectDto, @CurrentUser() user: CurrentUserData) {
    return this.projectService.create(createProjectDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: '获取所有项目' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: [ProjectResponseDto],
  })
  findAll(@CurrentUser() user: CurrentUserData) {
    return this.projectService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取项目详情' })
  @ApiResponse({ status: 200, description: '获取成功', type: ProjectResponseDto })
  @ApiResponse({ status: 404, description: '项目不存在' })
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.projectService.findOne(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新项目' })
  @ApiResponse({ status: 200, description: '更新成功', type: ProjectResponseDto })
  @ApiResponse({ status: 404, description: '项目不存在' })
  @ApiResponse({ status: 403, description: '无权限' })
  update(
    @Param('id') id: string,
    @RequestBody() updateProjectDto: UpdateProjectDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.projectService.update(id, updateProjectDto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除项目' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '项目不存在' })
  @ApiResponse({ status: 403, description: '无权限' })
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.projectService.remove(id, user.id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: '获取项目统计信息' })
  @ApiResponse({ status: 200, description: '获取成功', type: ProjectStatsDto })
  @ApiResponse({ status: 404, description: '项目不存在' })
  getStats(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.projectService.getStats(id, user.id);
  }
}
