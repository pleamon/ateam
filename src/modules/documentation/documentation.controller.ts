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
import { DocumentationService } from './services/documentation.service';
import { CreateDocumentationDto } from './dto/create-documentation.dto';
import { UpdateDocumentationDto } from './dto/update-documentation.dto';
import { DocumentationResponseDto } from './dto/documentation-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';

@ApiTags('文档管理')
@Controller('documentation')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DocumentationController {
  constructor(private readonly documentationService: DocumentationService) {}

  @Post()
  @ApiOperation({ summary: '创建文档' })
  @ApiResponse({ status: 201, description: '创建成功', type: DocumentationResponseDto })
  create(
    @RequestBody() createDocumentationDto: CreateDocumentationDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.documentationService.create(createDocumentationDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: '获取文档列表' })
  @ApiQuery({ name: 'projectId', required: false, description: '项目ID' })
  @ApiQuery({ name: 'type', required: false, description: '文档类型' })
  @ApiQuery({ name: 'status', required: false, description: '文档状态' })
  @ApiQuery({ name: 'visibility', required: false, description: '可见性' })
  @ApiQuery({ name: 'category', required: false, description: '分类' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: [DocumentationResponseDto],
  })
  findAll(
    @Query('projectId') projectId?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('visibility') visibility?: string,
    @Query('category') category?: string,
    @CurrentUser() user?: CurrentUserData,
  ) {
    const filters = { type, status, visibility, category };
    return this.documentationService.findAll(user.id, projectId, filters);
  }

  @Get('tags')
  @ApiOperation({ summary: '获取标签列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getTags() {
    return this.documentationService.getTags();
  }

  @Post('tags')
  @ApiOperation({ summary: '创建标签' })
  @ApiResponse({ status: 201, description: '创建成功' })
  createTag(
    @RequestBody('name') name: string,
    @RequestBody('description') description?: string,
    @RequestBody('color') color?: string,
  ) {
    return this.documentationService.createTag(name, description, color);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取文档详情' })
  @ApiResponse({ status: 200, description: '获取成功', type: DocumentationResponseDto })
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.documentationService.findOne(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新文档' })
  @ApiResponse({ status: 200, description: '更新成功', type: DocumentationResponseDto })
  update(
    @Param('id') id: string,
    @RequestBody() updateDocumentationDto: UpdateDocumentationDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.documentationService.update(id, updateDocumentationDto, user.id);
  }

  @Post(':id/publish')
  @ApiOperation({ summary: '发布文档' })
  @ApiResponse({ status: 200, description: '发布成功', type: DocumentationResponseDto })
  publish(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.documentationService.publish(id, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除文档' })
  @ApiResponse({ status: 200, description: '删除成功' })
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.documentationService.remove(id, user.id);
  }
}
