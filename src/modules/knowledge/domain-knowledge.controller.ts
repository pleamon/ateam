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
import { DomainKnowledgeService } from './domain-knowledge.service';
import {
  CreateDomainKnowledgeDto,
  CreateDomainConceptDto,
  CreateDomainPatternDto,
  CreateDomainBestPracticeDto,
} from './dto/create-domain-knowledge.dto';
import { DomainKnowledgeResponseDto } from '../documentation/dto/documentation-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';

@ApiTags('领域知识')
@Controller('domain-knowledge')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DomainKnowledgeController {
  constructor(private readonly domainKnowledgeService: DomainKnowledgeService) {}

  @Post()
  @ApiOperation({ summary: '创建领域知识' })
  @ApiResponse({ status: 201, description: '创建成功', type: DomainKnowledgeResponseDto })
  create(
    @RequestBody() createDomainKnowledgeDto: CreateDomainKnowledgeDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.domainKnowledgeService.create(createDomainKnowledgeDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: '获取领域知识列表' })
  @ApiQuery({ name: 'projectId', required: false, description: '项目ID' })
  @ApiQuery({ name: 'category', required: false, description: '知识分类' })
  @ApiQuery({ name: 'domain', required: false, description: '领域名称' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: [DomainKnowledgeResponseDto],
  })
  findAll(
    @Query('projectId') projectId?: string,
    @Query('category') category?: string,
    @Query('domain') domain?: string,
    @CurrentUser() user?: CurrentUserData,
  ) {
    const filters = { category, domain };
    return this.domainKnowledgeService.findAll(user.id, projectId, filters);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取领域知识详情' })
  @ApiResponse({ status: 200, description: '获取成功', type: DomainKnowledgeResponseDto })
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.domainKnowledgeService.findOne(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新领域知识' })
  @ApiResponse({ status: 200, description: '更新成功', type: DomainKnowledgeResponseDto })
  update(
    @Param('id') id: string,
    @RequestBody() updateData: any,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.domainKnowledgeService.update(id, updateData, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除领域知识' })
  @ApiResponse({ status: 200, description: '删除成功' })
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.domainKnowledgeService.remove(id, user.id);
  }

  @Post(':id/concepts')
  @ApiOperation({ summary: '添加概念' })
  @ApiResponse({ status: 201, description: '创建成功' })
  createConcept(
    @Param('id') domainKnowledgeId: string,
    @RequestBody() createConceptDto: CreateDomainConceptDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.domainKnowledgeService.createConcept(domainKnowledgeId, createConceptDto, user.id);
  }

  @Post(':id/patterns')
  @ApiOperation({ summary: '添加模式' })
  @ApiResponse({ status: 201, description: '创建成功' })
  createPattern(
    @Param('id') domainKnowledgeId: string,
    @RequestBody() createPatternDto: CreateDomainPatternDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.domainKnowledgeService.createPattern(domainKnowledgeId, createPatternDto, user.id);
  }

  @Post(':id/best-practices')
  @ApiOperation({ summary: '添加最佳实践' })
  @ApiResponse({ status: 201, description: '创建成功' })
  createBestPractice(
    @Param('id') domainKnowledgeId: string,
    @RequestBody() createBestPracticeDto: CreateDomainBestPracticeDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.domainKnowledgeService.createBestPractice(
      domainKnowledgeId,
      createBestPracticeDto,
      user.id,
    );
  }

  @Post(':id/anti-patterns')
  @ApiOperation({ summary: '添加反模式' })
  @ApiResponse({ status: 201, description: '创建成功' })
  createAntiPattern(
    @Param('id') domainKnowledgeId: string,
    @RequestBody() createAntiPatternDto: any,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.domainKnowledgeService.createAntiPattern(
      domainKnowledgeId,
      createAntiPatternDto,
      user.id,
    );
  }

  @Post(':id/references')
  @ApiOperation({ summary: '添加参考资料' })
  @ApiResponse({ status: 201, description: '创建成功' })
  createReference(
    @Param('id') domainKnowledgeId: string,
    @RequestBody() createReferenceDto: any,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.domainKnowledgeService.createReference(
      domainKnowledgeId,
      createReferenceDto,
      user.id,
    );
  }
}
