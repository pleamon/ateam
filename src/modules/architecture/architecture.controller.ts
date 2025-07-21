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
import { ArchitectureService } from './architecture.service';
import {
  CreateSystemArchitectureDto,
  CreatePlatformArchitectureDto,
  ArchitectureStatus,
} from './dto/create-architecture.dto';
import { SystemArchitectureResponseDto } from '../documentation/dto/documentation-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';

@ApiTags('架构设计')
@Controller('architectures')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ArchitectureController {
  constructor(private readonly architectureService: ArchitectureService) {}

  @Post()
  @ApiOperation({ summary: '创建系统架构' })
  @ApiResponse({ status: 201, description: '创建成功', type: SystemArchitectureResponseDto })
  create(
    @RequestBody() createArchitectureDto: CreateSystemArchitectureDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.architectureService.create(createArchitectureDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: '获取架构列表' })
  @ApiQuery({ name: 'projectId', required: false, description: '项目ID' })
  @ApiQuery({ name: 'status', required: false, description: '状态' })
  @ApiQuery({ name: 'version', required: false, description: '版本号' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: [SystemArchitectureResponseDto],
  })
  findAll(
    @Query('projectId') projectId?: string,
    @Query('status') status?: string,
    @Query('version') version?: string,
    @CurrentUser() user?: CurrentUserData,
  ) {
    const filters = { status, version };
    return this.architectureService.findAll(user.id, projectId, filters);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取架构详情' })
  @ApiResponse({ status: 200, description: '获取成功', type: SystemArchitectureResponseDto })
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.architectureService.findOne(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新架构' })
  @ApiResponse({ status: 200, description: '更新成功', type: SystemArchitectureResponseDto })
  update(
    @Param('id') id: string,
    @RequestBody() updateData: any,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.architectureService.update(id, updateData, user.id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: '更新架构状态' })
  @ApiResponse({ status: 200, description: '更新成功', type: SystemArchitectureResponseDto })
  updateStatus(
    @Param('id') id: string,
    @RequestBody('status') status: ArchitectureStatus,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.architectureService.updateStatus(id, status, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除架构' })
  @ApiResponse({ status: 200, description: '删除成功' })
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.architectureService.remove(id, user.id);
  }

  @Post(':id/platforms')
  @ApiOperation({ summary: '添加平台架构' })
  @ApiResponse({ status: 201, description: '创建成功' })
  createPlatformArchitecture(
    @Param('id') systemArchitectureId: string,
    @RequestBody() createPlatformDto: CreatePlatformArchitectureDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.architectureService.createPlatformArchitecture(
      systemArchitectureId,
      createPlatformDto,
      user.id,
    );
  }

  @Patch('platforms/:platformId')
  @ApiOperation({ summary: '更新平台架构' })
  @ApiResponse({ status: 200, description: '更新成功' })
  updatePlatformArchitecture(
    @Param('platformId') platformId: string,
    @RequestBody() updateData: any,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.architectureService.updatePlatformArchitecture(platformId, updateData, user.id);
  }

  @Delete('platforms/:platformId')
  @ApiOperation({ summary: '删除平台架构' })
  @ApiResponse({ status: 200, description: '删除成功' })
  removePlatformArchitecture(
    @Param('platformId') platformId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.architectureService.removePlatformArchitecture(platformId, user.id);
  }
}
