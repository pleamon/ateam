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
import { RequirementService } from './requirement.service';
import {
  CreateRequirementDto,
  CreateRequirementQuestionDto,
  RequirementStatus,
} from './dto/create-requirement.dto';
import { RequirementResponseDto } from '../documentation/dto/documentation-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';

@ApiTags('需求管理')
@Controller('requirements')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RequirementController {
  constructor(private readonly requirementService: RequirementService) {}

  @Post()
  @ApiOperation({ summary: '创建需求' })
  @ApiResponse({ status: 201, description: '创建成功', type: RequirementResponseDto })
  create(
    @RequestBody() createRequirementDto: CreateRequirementDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.requirementService.create(createRequirementDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: '获取需求列表' })
  @ApiQuery({ name: 'projectId', required: false, description: '项目ID' })
  @ApiQuery({ name: 'type', required: false, description: '需求类型' })
  @ApiQuery({ name: 'priority', required: false, description: '优先级' })
  @ApiQuery({ name: 'status', required: false, description: '状态' })
  @ApiQuery({ name: 'source', required: false, description: '来源' })
  @ApiQuery({ name: 'includeChildren', required: false, description: '包含子需求' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: [RequirementResponseDto],
  })
  findAll(
    @Query('projectId') projectId?: string,
    @Query('type') type?: string,
    @Query('priority') priority?: string,
    @Query('status') status?: string,
    @Query('source') source?: string,
    @Query('includeChildren') includeChildren?: string,
    @CurrentUser() user?: CurrentUserData,
  ) {
    const filters = {
      type,
      priority,
      status,
      source,
      includeChildren: includeChildren === 'true',
    };
    return this.requirementService.findAll(user.id, projectId, filters);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取需求详情' })
  @ApiResponse({ status: 200, description: '获取成功', type: RequirementResponseDto })
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.requirementService.findOne(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新需求' })
  @ApiResponse({ status: 200, description: '更新成功', type: RequirementResponseDto })
  update(
    @Param('id') id: string,
    @RequestBody() updateData: any,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.requirementService.update(id, updateData, user.id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: '更新需求状态' })
  @ApiResponse({ status: 200, description: '更新成功', type: RequirementResponseDto })
  updateStatus(
    @Param('id') id: string,
    @RequestBody('status') status: RequirementStatus,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.requirementService.updateStatus(id, status, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除需求' })
  @ApiResponse({ status: 200, description: '删除成功' })
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.requirementService.remove(id, user.id);
  }

  @Post(':id/questions')
  @ApiOperation({ summary: '创建需求问题' })
  @ApiResponse({ status: 201, description: '创建成功' })
  createQuestion(
    @Param('id') requirementId: string,
    @RequestBody() createQuestionDto: CreateRequirementQuestionDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.requirementService.createQuestion(requirementId, createQuestionDto, user.id);
  }

  @Patch('questions/:questionId')
  @ApiOperation({ summary: '更新需求问题' })
  @ApiResponse({ status: 200, description: '更新成功' })
  updateQuestion(
    @Param('questionId') questionId: string,
    @RequestBody() updateData: any,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.requirementService.updateQuestion(questionId, updateData, user.id);
  }

  @Delete('questions/:questionId')
  @ApiOperation({ summary: '删除需求问题' })
  @ApiResponse({ status: 200, description: '删除成功' })
  removeQuestion(@Param('questionId') questionId: string, @CurrentUser() user: CurrentUserData) {
    return this.requirementService.removeQuestion(questionId, user.id);
  }
}
