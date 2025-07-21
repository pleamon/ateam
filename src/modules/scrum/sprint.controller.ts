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
import { SprintService } from './sprint.service';
import { CreateSprintDto } from './dto/create-sprint.dto';
import { UpdateSprintDto } from './dto/update-sprint.dto';
import { SprintResponseDto, SprintStatsDto } from './dto/scrum-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';

@ApiTags('Sprint管理')
@Controller('sprints')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SprintController {
  constructor(private readonly sprintService: SprintService) {}

  @Post()
  @ApiOperation({ summary: '创建Sprint' })
  @ApiResponse({ status: 201, description: '创建成功', type: SprintResponseDto })
  create(@RequestBody() createSprintDto: CreateSprintDto, @CurrentUser() user: CurrentUserData) {
    return this.sprintService.create(createSprintDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: '获取Sprint列表' })
  @ApiQuery({ name: 'projectId', required: false, description: '项目ID' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: [SprintResponseDto],
  })
  findAll(@Query('projectId') projectId?: string, @CurrentUser() user?: CurrentUserData) {
    return this.sprintService.findAll(user.id, projectId);
  }

  @Get('stats')
  @ApiOperation({ summary: '获取Sprint统计信息' })
  @ApiQuery({ name: 'projectId', required: false, description: '项目ID' })
  @ApiResponse({ status: 200, description: '获取成功', type: SprintStatsDto })
  getStats(@Query('projectId') projectId?: string, @CurrentUser() user?: CurrentUserData) {
    return this.sprintService.getStats(user.id, projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取Sprint详情' })
  @ApiResponse({ status: 200, description: '获取成功', type: SprintResponseDto })
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.sprintService.findOne(id, user.id);
  }

  @Get('project/:projectId/active')
  @ApiOperation({ summary: '获取项目当前活跃的Sprint' })
  @ApiResponse({ status: 200, description: '获取成功', type: SprintResponseDto })
  getActiveSprint(@Param('projectId') projectId: string, @CurrentUser() user: CurrentUserData) {
    return this.sprintService.getActiveSprint(projectId, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新Sprint' })
  @ApiResponse({ status: 200, description: '更新成功', type: SprintResponseDto })
  update(
    @Param('id') id: string,
    @RequestBody() updateSprintDto: UpdateSprintDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.sprintService.update(id, updateSprintDto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除Sprint' })
  @ApiResponse({ status: 200, description: '删除成功' })
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.sprintService.remove(id, user.id);
  }
}
