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
import { ApiDesignService } from './services/api-design.service';
import { CreateApiDesignDto, CreateApiExampleDto, ApiStatus } from './dto/create-api-design.dto';
import { ApiDesignResponseDto } from './dto/documentation-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';

@ApiTags('API设计')
@Controller('api-designs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ApiDesignController {
  constructor(private readonly apiDesignService: ApiDesignService) {}

  @Post()
  @ApiOperation({ summary: '创建API设计' })
  @ApiResponse({ status: 201, description: '创建成功', type: ApiDesignResponseDto })
  create(@RequestBody() createApiDesignDto: CreateApiDesignDto, @CurrentUser() user: CurrentUserData) {
    return this.apiDesignService.create(createApiDesignDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: '获取API设计列表' })
  @ApiQuery({ name: 'projectId', required: false, description: '项目ID' })
  @ApiQuery({ name: 'platform', required: false, description: '平台' })
  @ApiQuery({ name: 'module', required: false, description: '模块' })
  @ApiQuery({ name: 'status', required: false, description: '状态' })
  @ApiQuery({ name: 'apiMethod', required: false, description: '请求方法' })
  @ApiQuery({ name: 'apiPath', required: false, description: 'API路径' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: [ApiDesignResponseDto],
  })
  findAll(
    @Query('projectId') projectId?: string,
    @Query('platform') platform?: string,
    @Query('module') module?: string,
    @Query('status') status?: string,
    @Query('apiMethod') apiMethod?: string,
    @Query('apiPath') apiPath?: string,
    @CurrentUser() user?: CurrentUserData,
  ) {
    const filters = { platform, module, status, apiMethod, apiPath };
    return this.apiDesignService.findAll(user.id, projectId, filters);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取API设计详情' })
  @ApiResponse({ status: 200, description: '获取成功', type: ApiDesignResponseDto })
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.apiDesignService.findOne(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新API设计' })
  @ApiResponse({ status: 200, description: '更新成功', type: ApiDesignResponseDto })
  update(
    @Param('id') id: string,
    @RequestBody() updateData: any,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.apiDesignService.update(id, updateData, user.id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: '更新API状态' })
  @ApiResponse({ status: 200, description: '更新成功', type: ApiDesignResponseDto })
  updateStatus(
    @Param('id') id: string,
    @RequestBody('status') status: ApiStatus,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.apiDesignService.updateStatus(id, status, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除API设计' })
  @ApiResponse({ status: 200, description: '删除成功' })
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.apiDesignService.remove(id, user.id);
  }

  @Post(':id/examples')
  @ApiOperation({ summary: '添加API示例' })
  @ApiResponse({ status: 201, description: '创建成功' })
  createExample(
    @Param('id') apiDesignId: string,
    @RequestBody() createExampleDto: CreateApiExampleDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.apiDesignService.createExample(apiDesignId, createExampleDto, user.id);
  }

  @Patch('examples/:exampleId')
  @ApiOperation({ summary: '更新API示例' })
  @ApiResponse({ status: 200, description: '更新成功' })
  updateExample(
    @Param('exampleId') exampleId: string,
    @RequestBody() updateData: any,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.apiDesignService.updateExample(exampleId, updateData, user.id);
  }

  @Delete('examples/:exampleId')
  @ApiOperation({ summary: '删除API示例' })
  @ApiResponse({ status: 200, description: '删除成功' })
  removeExample(@Param('exampleId') exampleId: string, @CurrentUser() user: CurrentUserData) {
    return this.apiDesignService.removeExample(exampleId, user.id);
  }

  @Post(':id/error-codes')
  @ApiOperation({ summary: '添加错误码' })
  @ApiResponse({ status: 201, description: '创建成功' })
  createErrorCode(
    @Param('id') apiDesignId: string,
    @RequestBody() createErrorCodeDto: any,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.apiDesignService.createErrorCode(apiDesignId, createErrorCodeDto, user.id);
  }

  @Patch('error-codes/:errorCodeId')
  @ApiOperation({ summary: '更新错误码' })
  @ApiResponse({ status: 200, description: '更新成功' })
  updateErrorCode(
    @Param('errorCodeId') errorCodeId: string,
    @RequestBody() updateData: any,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.apiDesignService.updateErrorCode(errorCodeId, updateData, user.id);
  }

  @Delete('error-codes/:errorCodeId')
  @ApiOperation({ summary: '删除错误码' })
  @ApiResponse({ status: 200, description: '删除成功' })
  removeErrorCode(@Param('errorCodeId') errorCodeId: string, @CurrentUser() user: CurrentUserData) {
    return this.apiDesignService.removeErrorCode(errorCodeId, user.id);
  }
}
