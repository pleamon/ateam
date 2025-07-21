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
import { MindMapService } from './services/mindmap.service';
import { CreateMindMapDto, CreateMindMapNodeDto } from './dto/create-mindmap.dto';
import { MindMapResponseDto } from './dto/documentation-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';

@ApiTags('思维导图')
@Controller('mindmaps')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MindMapController {
  constructor(private readonly mindMapService: MindMapService) {}

  @Post()
  @ApiOperation({ summary: '创建思维导图' })
  @ApiResponse({ status: 201, description: '创建成功', type: MindMapResponseDto })
  create(@RequestBody() createMindMapDto: CreateMindMapDto, @CurrentUser() user: CurrentUserData) {
    return this.mindMapService.create(createMindMapDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: '获取思维导图列表' })
  @ApiQuery({ name: 'projectId', required: false, description: '项目ID' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: [MindMapResponseDto],
  })
  findAll(@Query('projectId') projectId?: string, @CurrentUser() user?: CurrentUserData) {
    return this.mindMapService.findAll(user.id, projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取思维导图详情' })
  @ApiResponse({ status: 200, description: '获取成功', type: MindMapResponseDto })
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.mindMapService.findOne(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新思维导图' })
  @ApiResponse({ status: 200, description: '更新成功', type: MindMapResponseDto })
  update(
    @Param('id') id: string,
    @RequestBody() updateData: any,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.mindMapService.update(id, updateData, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除思维导图' })
  @ApiResponse({ status: 200, description: '删除成功' })
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.mindMapService.remove(id, user.id);
  }

  @Post(':id/nodes')
  @ApiOperation({ summary: '创建节点' })
  @ApiResponse({ status: 201, description: '创建成功' })
  createNode(
    @Param('id') mindMapId: string,
    @RequestBody() createNodeDto: CreateMindMapNodeDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.mindMapService.createNode(mindMapId, createNodeDto, user.id);
  }

  @Patch('nodes/:nodeId')
  @ApiOperation({ summary: '更新节点' })
  @ApiResponse({ status: 200, description: '更新成功' })
  updateNode(
    @Param('nodeId') nodeId: string,
    @RequestBody() updateData: any,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.mindMapService.updateNode(nodeId, updateData, user.id);
  }

  @Delete('nodes/:nodeId')
  @ApiOperation({ summary: '删除节点' })
  @ApiResponse({ status: 200, description: '删除成功' })
  removeNode(@Param('nodeId') nodeId: string, @CurrentUser() user: CurrentUserData) {
    return this.mindMapService.removeNode(nodeId, user.id);
  }
}
