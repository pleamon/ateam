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
import { PromptTemplateService } from './prompt-template.service';
import {
  CreatePromptTemplateDto,
  UpdatePromptTemplateDto,
  PromptTemplateResponseDto,
} from './dto/prompt-template.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';

@ApiTags('提示词模板')
@Controller('prompt-templates')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PromptTemplateController {
  constructor(private readonly templateService: PromptTemplateService) {}

  @Post()
  @ApiOperation({ summary: '创建提示词模板' })
  @ApiResponse({
    status: 201,
    description: '创建成功',
    type: PromptTemplateResponseDto,
  })
  create(@RequestBody() createDto: CreatePromptTemplateDto, @CurrentUser() user: CurrentUserData) {
    return this.templateService.create(createDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: '获取所有提示词模板' })
  @ApiQuery({
    name: 'onlyActive',
    required: false,
    type: Boolean,
    description: '是否只返回启用的模板',
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: [PromptTemplateResponseDto],
  })
  findAll(@Query('onlyActive') onlyActive?: string) {
    return this.templateService.findAll(onlyActive === 'true');
  }

  @Get('by-responsibility/:responsibility')
  @ApiOperation({ summary: '按职责获取提示词模板' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: [PromptTemplateResponseDto],
  })
  findByResponsibility(@Param('responsibility') responsibility: string) {
    return this.templateService.findByResponsibility(responsibility);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取提示词模板详情' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: PromptTemplateResponseDto,
  })
  findOne(@Param('id') id: string) {
    return this.templateService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新提示词模板' })
  @ApiResponse({
    status: 200,
    description: '更新成功',
    type: PromptTemplateResponseDto,
  })
  update(
    @Param('id') id: string,
    @RequestBody() updateDto: UpdatePromptTemplateDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.templateService.update(id, updateDto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除提示词模板' })
  @ApiResponse({ status: 200, description: '删除成功' })
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.templateService.remove(id, user.id);
  }

  @Post('initialize')
  @ApiOperation({ summary: '初始化默认提示词模板' })
  @ApiResponse({ status: 201, description: '初始化成功' })
  initializeDefaults(@CurrentUser() user: CurrentUserData) {
    return this.templateService.initializeDefaults(user.id);
  }
}
