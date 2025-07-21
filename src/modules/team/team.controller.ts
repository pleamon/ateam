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
import { TeamService } from './team.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { TeamResponseDto, TeamStatsDto } from './dto/team-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';

@ApiTags('团队管理')
@Controller('teams')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Post()
  @ApiOperation({ summary: '创建团队' })
  @ApiResponse({ status: 201, description: '创建成功', type: TeamResponseDto })
  create(@RequestBody() createTeamDto: CreateTeamDto, @CurrentUser() user: CurrentUserData) {
    return this.teamService.create(createTeamDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: '获取团队列表' })
  @ApiQuery({ name: 'projectId', required: false, description: '项目ID' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: [TeamResponseDto],
  })
  findAll(@Query('projectId') projectId?: string, @CurrentUser() user?: CurrentUserData) {
    return this.teamService.findAll(user.id, projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取团队详情' })
  @ApiResponse({ status: 200, description: '获取成功', type: TeamResponseDto })
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.teamService.findOne(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新团队' })
  @ApiResponse({ status: 200, description: '更新成功', type: TeamResponseDto })
  update(
    @Param('id') id: string,
    @RequestBody() updateTeamDto: UpdateTeamDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.teamService.update(id, updateTeamDto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除团队' })
  @ApiResponse({ status: 200, description: '删除成功' })
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.teamService.remove(id, user.id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: '获取团队统计信息' })
  @ApiResponse({ status: 200, description: '获取成功', type: TeamStatsDto })
  getStats(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.teamService.getStats(id, user.id);
  }
}
