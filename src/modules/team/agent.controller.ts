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
import { AgentService } from './agent.service';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';
import { AgentResponseDto } from './dto/team-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';

@ApiTags('Agent管理')
@Controller('agents')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post()
  @ApiOperation({ summary: '创建Agent' })
  @ApiResponse({ status: 201, description: '创建成功', type: AgentResponseDto })
  create(@RequestBody() createAgentDto: CreateAgentDto, @CurrentUser() user: CurrentUserData) {
    return this.agentService.create(createAgentDto, user.id);
  }

  @Get('team/:teamId')
  @ApiOperation({ summary: '获取团队的所有Agent' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: [AgentResponseDto],
  })
  findByTeam(@Param('teamId') teamId: string, @CurrentUser() user: CurrentUserData) {
    return this.agentService.findByTeam(teamId, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取Agent详情' })
  @ApiResponse({ status: 200, description: '获取成功', type: AgentResponseDto })
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.agentService.findOne(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新Agent' })
  @ApiResponse({ status: 200, description: '更新成功', type: AgentResponseDto })
  update(
    @Param('id') id: string,
    @RequestBody() updateAgentDto: UpdateAgentDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.agentService.update(id, updateAgentDto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除Agent' })
  @ApiResponse({ status: 200, description: '删除成功' })
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.agentService.remove(id, user.id);
  }

  @Get(':id/worklogs')
  @ApiOperation({ summary: '获取Agent工作日志' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getWorkLogs(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.agentService.getWorkLogs(id, user.id);
  }

  @Get(':id/activities')
  @ApiOperation({ summary: '获取Agent活动记录' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getActivities(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.agentService.getActivities(id, user.id);
  }

  @Get(':id/tasks')
  @ApiOperation({ summary: '获取Agent任务' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getTasks(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.agentService.getTasks(id, user.id);
  }
}
