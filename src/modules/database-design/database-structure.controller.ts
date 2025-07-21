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
import { DatabaseStructureService } from './database-structure.service';
import {
  CreateDatabaseSchemaDto,
  CreateDatabaseTableDto,
  CreateTableColumnDto,
} from './dto/create-database-structure.dto';
import { DatabaseSchemaResponseDto } from '../documentation/dto/documentation-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';

@ApiTags('数据库结构')
@Controller('database-structures')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DatabaseStructureController {
  constructor(private readonly databaseStructureService: DatabaseStructureService) {}

  @Post('schemas')
  @ApiOperation({ summary: '创建数据库架构' })
  @ApiResponse({ status: 201, description: '创建成功', type: DatabaseSchemaResponseDto })
  createSchema(
    @RequestBody() createSchemaDto: CreateDatabaseSchemaDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.databaseStructureService.createSchema(createSchemaDto, user.id);
  }

  @Get('schemas')
  @ApiOperation({ summary: '获取数据库架构列表' })
  @ApiQuery({ name: 'projectId', required: false, description: '项目ID' })
  @ApiQuery({ name: 'engine', required: false, description: '数据库引擎' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: [DatabaseSchemaResponseDto],
  })
  findAllSchemas(
    @Query('projectId') projectId?: string,
    @Query('engine') engine?: string,
    @CurrentUser() user?: CurrentUserData,
  ) {
    const filters = { engine };
    return this.databaseStructureService.findAllSchemas(user.id, projectId, filters);
  }

  @Get('schemas/:id')
  @ApiOperation({ summary: '获取数据库架构详情' })
  @ApiResponse({ status: 200, description: '获取成功', type: DatabaseSchemaResponseDto })
  findOneSchema(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.databaseStructureService.findOneSchema(id, user.id);
  }

  @Patch('schemas/:id')
  @ApiOperation({ summary: '更新数据库架构' })
  @ApiResponse({ status: 200, description: '更新成功', type: DatabaseSchemaResponseDto })
  updateSchema(
    @Param('id') id: string,
    @RequestBody() updateData: any,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.databaseStructureService.updateSchema(id, updateData, user.id);
  }

  @Delete('schemas/:id')
  @ApiOperation({ summary: '删除数据库架构' })
  @ApiResponse({ status: 200, description: '删除成功' })
  removeSchema(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.databaseStructureService.removeSchema(id, user.id);
  }

  @Post('schemas/:schemaId/tables')
  @ApiOperation({ summary: '创建数据表' })
  @ApiResponse({ status: 201, description: '创建成功' })
  createTable(
    @Param('schemaId') schemaId: string,
    @RequestBody() createTableDto: CreateDatabaseTableDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.databaseStructureService.createTable(schemaId, createTableDto, user.id);
  }

  @Get('tables/:tableId')
  @ApiOperation({ summary: '获取数据表详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  findOneTable(@Param('tableId') tableId: string, @CurrentUser() user: CurrentUserData) {
    return this.databaseStructureService.findOneTable(tableId, user.id);
  }

  @Patch('tables/:tableId')
  @ApiOperation({ summary: '更新数据表' })
  @ApiResponse({ status: 200, description: '更新成功' })
  updateTable(
    @Param('tableId') tableId: string,
    @RequestBody() updateData: any,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.databaseStructureService.updateTable(tableId, updateData, user.id);
  }

  @Delete('tables/:tableId')
  @ApiOperation({ summary: '删除数据表' })
  @ApiResponse({ status: 200, description: '删除成功' })
  removeTable(@Param('tableId') tableId: string, @CurrentUser() user: CurrentUserData) {
    return this.databaseStructureService.removeTable(tableId, user.id);
  }

  @Post('tables/:tableId/columns')
  @ApiOperation({ summary: '添加表列' })
  @ApiResponse({ status: 201, description: '创建成功' })
  createColumn(
    @Param('tableId') tableId: string,
    @RequestBody() createColumnDto: CreateTableColumnDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.databaseStructureService.createColumn(tableId, createColumnDto, user.id);
  }

  @Patch('columns/:columnId')
  @ApiOperation({ summary: '更新表列' })
  @ApiResponse({ status: 200, description: '更新成功' })
  updateColumn(
    @Param('columnId') columnId: string,
    @RequestBody() updateData: any,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.databaseStructureService.updateColumn(columnId, updateData, user.id);
  }

  @Delete('columns/:columnId')
  @ApiOperation({ summary: '删除表列' })
  @ApiResponse({ status: 200, description: '删除成功' })
  removeColumn(@Param('columnId') columnId: string, @CurrentUser() user: CurrentUserData) {
    return this.databaseStructureService.removeColumn(columnId, user.id);
  }

  @Post('tables/:tableId/indexes')
  @ApiOperation({ summary: '添加索引' })
  @ApiResponse({ status: 201, description: '创建成功' })
  createIndex(
    @Param('tableId') tableId: string,
    @RequestBody() createIndexDto: any,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.databaseStructureService.createIndex(tableId, createIndexDto, user.id);
  }

  @Post('relations')
  @ApiOperation({ summary: '创建表关系' })
  @ApiResponse({ status: 201, description: '创建成功' })
  createRelation(@RequestBody() createRelationDto: any, @CurrentUser() user: CurrentUserData) {
    return this.databaseStructureService.createRelation(createRelationDto, user.id);
  }
}
