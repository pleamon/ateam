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
import { TaskService } from './task.service';
import { CreateTaskDto, TaskStatus } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AssignTaskDto } from './dto/assign-task.dto';
import { TaskResponseDto, TaskStatsDto } from './dto/scrum-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';

@ApiTags('任务管理')
@Controller('tasks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @ApiOperation({ summary: '创建任务' })
  @ApiResponse({ status: 201, description: '创建成功', type: TaskResponseDto })
  create(@RequestBody() createTaskDto: CreateTaskDto, @CurrentUser() user: CurrentUserData) {
    return this.taskService.create(createTaskDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: '获取任务列表' })
  @ApiQuery({ name: 'projectId', required: false, description: '项目ID' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: [TaskResponseDto],
  })
  findAll(@Query('projectId') projectId?: string, @CurrentUser() user?: CurrentUserData) {
    return this.taskService.findAll(user.id, projectId);
  }

  @Get('stats')
  @ApiOperation({ summary: '获取任务统计信息' })
  @ApiQuery({ name: 'projectId', required: false, description: '项目ID' })
  @ApiResponse({ status: 200, description: '获取成功', type: TaskStatsDto })
  getStats(@Query('projectId') projectId?: string, @CurrentUser() user?: CurrentUserData) {
    return this.taskService.getStats(user.id, projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取任务详情' })
  @ApiResponse({ status: 200, description: '获取成功', type: TaskResponseDto })
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.taskService.findOne(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新任务' })
  @ApiResponse({ status: 200, description: '更新成功', type: TaskResponseDto })
  update(
    @Param('id') id: string,
    @RequestBody() updateTaskDto: UpdateTaskDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.taskService.update(id, updateTaskDto, user.id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: '更新任务状态' })
  @ApiResponse({ status: 200, description: '更新成功', type: TaskResponseDto })
  updateStatus(
    @Param('id') id: string,
    @RequestBody('status') status: TaskStatus,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.taskService.updateStatus(id, status, user.id);
  }

  @Post(':id/assign')
  @ApiOperation({ summary: '分配任务' })
  @ApiResponse({ status: 200, description: '分配成功' })
  assignTask(
    @Param('id') id: string,
    @RequestBody() assignTaskDto: AssignTaskDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.taskService.assignTask(id, assignTaskDto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除任务' })
  @ApiResponse({ status: 200, description: '删除成功' })
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.taskService.remove(id, user.id);
  }
}
