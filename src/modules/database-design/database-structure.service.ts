import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@shared/prisma/prisma.service';
import {
  CreateDatabaseSchemaDto,
  CreateDatabaseTableDto,
  CreateTableColumnDto,
} from './dto/create-database-structure.dto';
import { PermissionService, Permission } from '../auth/permission.service';

@Injectable()
export class DatabaseStructureService {
  constructor(
    private prisma: PrismaService,
    private permissionService: PermissionService,
  ) { }

  async createSchema(createSchemaDto: CreateDatabaseSchemaDto, userId: string) {
    const { projectId, ...schemaData } = createSchemaDto;

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.DOCUMENTATION_CREATE,
      projectId,
    );

    const databaseSchema = await this.prisma.databaseSchema.create({
      data: {
        ...schemaData,
        projectId,
        userId,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            tables: true,
          },
        },
      },
    });

    // 记录审计日志
    await this.permissionService.logAction(
      userId,
      'DATABASE_SCHEMA_CREATE',
      'DATABASE_SCHEMA',
      databaseSchema.id,
      { schemaName: databaseSchema.schemaName, engine: databaseSchema.engine, projectId },
    );

    return databaseSchema;
  }

  async findAllSchemas(userId: string, projectId?: string, filters?: any) {
    const where: any = { deletedAt: null };

    if (projectId) {
      // 检查用户权限
      await this.permissionService.requirePermission(
        userId,
        Permission.DOCUMENTATION_READ,
        projectId,
      );
      where.projectId = projectId;
    } else {
      // 只查看用户有权限的项目数据库
      where.project = {
        members: {
          some: {
            userId,
          },
        },
      };
    }

    // 应用过滤器
    if (filters?.engine) where.engine = filters.engine;

    const schemas = await this.prisma.databaseSchema.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            tables: true,
          },
        },
      },
      orderBy: {
        schemaName: 'asc',
      },
    });

    return schemas;
  }

  async findOneSchema(id: string, userId: string) {
    const databaseSchema = await this.prisma.databaseSchema.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        tables: {
          include: {
            _count: {
              select: {
                columns: true,
                indexes: true,
              },
            },
          },
          orderBy: {
            tableName: 'asc',
          },
        },
        _count: {
          select: {
            tables: true,
          },
        },
      },
    });

    if (!databaseSchema || databaseSchema.deletedAt) {
      throw new NotFoundException('数据库架构不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.DOCUMENTATION_READ,
      databaseSchema.projectId,
    );

    return databaseSchema;
  }

  async updateSchema(id: string, updateData: any, userId: string) {
    const existingSchema = await this.prisma.databaseSchema.findUnique({
      where: { id },
      select: { projectId: true },
    });

    if (!existingSchema) {
      throw new NotFoundException('数据库架构不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.DOCUMENTATION_UPDATE,
      existingSchema.projectId,
    );

    const databaseSchema = await this.prisma.databaseSchema.update({
      where: { id },
      data: {
        ...updateData,
        version: {
          increment: 1,
        },
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            tables: true,
          },
        },
      },
    });

    // 记录审计日志
    await this.permissionService.logAction(
      userId,
      'DATABASE_SCHEMA_UPDATE',
      'DATABASE_SCHEMA',
      id,
      { changes: updateData },
    );

    return databaseSchema;
  }

  async removeSchema(id: string, userId: string) {
    const existingSchema = await this.prisma.databaseSchema.findUnique({
      where: { id },
      select: { projectId: true, schemaName: true },
    });

    if (!existingSchema) {
      throw new NotFoundException('数据库架构不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.DOCUMENTATION_DELETE,
      existingSchema.projectId,
    );

    // 软删除
    await this.prisma.databaseSchema.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    // 记录审计日志
    await this.permissionService.logAction(
      userId,
      'DATABASE_SCHEMA_DELETE',
      'DATABASE_SCHEMA',
      id,
      { schemaName: existingSchema.schemaName },
    );

    return { message: '数据库架构删除成功' };
  }

  // 表管理
  async createTable(schemaId: string, createTableDto: CreateDatabaseTableDto, userId: string) {
    const schema = await this.prisma.databaseSchema.findUnique({
      where: { id: schemaId },
      select: { projectId: true },
    });

    if (!schema) {
      throw new NotFoundException('数据库架构不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.DOCUMENTATION_UPDATE,
      schema.projectId,
    );

    const table = await this.prisma.databaseTable.create({
      data: {
        ...createTableDto,
        schemaId,
      },
      include: {
        _count: {
          select: {
            columns: true,
            indexes: true,
          },
        },
      },
    });

    return table;
  }

  async findOneTable(tableId: string, userId: string) {
    const table = await this.prisma.databaseTable.findUnique({
      where: { id: tableId },
      include: {
        schema: {
          select: {
            id: true,
            schemaName: true,
            projectId: true,
          },
        },
        columns: {
          orderBy: {
            position: 'asc',
          },
        },
        indexes: {
          orderBy: {
            indexName: 'asc',
          },
        },
        sourceRelations: {
          include: {
            targetTable: {
              select: {
                id: true,
                tableName: true,
                displayName: true,
              },
            },
          },
        },
        targetRelations: {
          include: {
            sourceTable: {
              select: {
                id: true,
                tableName: true,
                displayName: true,
              },
            },
          },
        },
        _count: {
          select: {
            columns: true,
            indexes: true,
            sourceRelations: true,
            targetRelations: true,
          },
        },
      },
    });

    if (!table) {
      throw new NotFoundException('数据表不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.DOCUMENTATION_READ,
      table.schema.projectId,
    );

    return table;
  }

  async updateTable(tableId: string, updateData: any, userId: string) {
    const table = await this.prisma.databaseTable.findUnique({
      where: { id: tableId },
      include: {
        schema: {
          select: {
            projectId: true,
          },
        },
      },
    });

    if (!table) {
      throw new NotFoundException('数据表不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.DOCUMENTATION_UPDATE,
      table.schema.projectId,
    );

    const updatedTable = await this.prisma.databaseTable.update({
      where: { id: tableId },
      data: updateData,
      include: {
        _count: {
          select: {
            columns: true,
            indexes: true,
          },
        },
      },
    });

    return updatedTable;
  }

  async removeTable(tableId: string, userId: string) {
    const table = await this.prisma.databaseTable.findUnique({
      where: { id: tableId },
      include: {
        schema: {
          select: {
            projectId: true,
          },
        },
      },
    });

    if (!table) {
      throw new NotFoundException('数据表不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.DOCUMENTATION_UPDATE,
      table.schema.projectId,
    );

    await this.prisma.databaseTable.delete({
      where: { id: tableId },
    });

    return { message: '数据表删除成功' };
  }

  // 列管理
  async createColumn(tableId: string, createColumnDto: CreateTableColumnDto, userId: string) {
    const table = await this.prisma.databaseTable.findUnique({
      where: { id: tableId },
      include: {
        schema: {
          select: {
            projectId: true,
          },
        },
      },
    });

    if (!table) {
      throw new NotFoundException('数据表不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.DOCUMENTATION_UPDATE,
      table.schema.projectId,
    );

    const column = await this.prisma.tableColumn.create({
      data: {
        ...createColumnDto,
        tableId,
      },
    });

    return column;
  }

  async updateColumn(columnId: string, updateData: any, userId: string) {
    const column = await this.prisma.tableColumn.findUnique({
      where: { id: columnId },
      include: {
        table: {
          include: {
            schema: {
              select: {
                projectId: true,
              },
            },
          },
        },
      },
    });

    if (!column) {
      throw new NotFoundException('列不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.DOCUMENTATION_UPDATE,
      column.table.schema.projectId,
    );

    const updatedColumn = await this.prisma.tableColumn.update({
      where: { id: columnId },
      data: updateData,
    });

    return updatedColumn;
  }

  async removeColumn(columnId: string, userId: string) {
    const column = await this.prisma.tableColumn.findUnique({
      where: { id: columnId },
      include: {
        table: {
          include: {
            schema: {
              select: {
                projectId: true,
              },
            },
          },
        },
      },
    });

    if (!column) {
      throw new NotFoundException('列不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.DOCUMENTATION_UPDATE,
      column.table.schema.projectId,
    );

    await this.prisma.tableColumn.delete({
      where: { id: columnId },
    });

    return { message: '列删除成功' };
  }

  // 索引管理
  async createIndex(tableId: string, createIndexDto: any, userId: string) {
    const table = await this.prisma.databaseTable.findUnique({
      where: { id: tableId },
      include: {
        schema: {
          select: {
            projectId: true,
          },
        },
      },
    });

    if (!table) {
      throw new NotFoundException('数据表不存在');
    }

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.DOCUMENTATION_UPDATE,
      table.schema.projectId,
    );

    const index = await this.prisma.databaseIndex.create({
      data: {
        ...createIndexDto,
        tableId,
      },
    });

    return index;
  }

  // 关系管理
  async createRelation(createRelationDto: any, userId: string) {
    // 验证源表和目标表是否存在于同一架构
    const sourceTable = await this.prisma.databaseTable.findUnique({
      where: { id: createRelationDto.sourceTableId },
      select: { schemaId: true },
    });

    const targetTable = await this.prisma.databaseTable.findUnique({
      where: { id: createRelationDto.targetTableId },
      select: { schemaId: true },
    });

    if (!sourceTable || !targetTable) {
      throw new NotFoundException('源表或目标表不存在');
    }

    if (sourceTable.schemaId !== targetTable.schemaId) {
      throw new Error('源表和目标表必须属于同一数据库架构');
    }

    const schema = await this.prisma.databaseSchema.findUnique({
      where: { id: sourceTable.schemaId },
      select: { projectId: true },
    });

    // 检查用户权限
    await this.permissionService.requirePermission(
      userId,
      Permission.DOCUMENTATION_UPDATE,
      schema.projectId,
    );

    const relation = await this.prisma.databaseRelation.create({
      data: {
        ...createRelationDto,
        schemaId: sourceTable.schemaId,
      },
      include: {
        sourceTable: {
          select: {
            id: true,
            tableName: true,
            displayName: true,
          },
        },
        targetTable: {
          select: {
            id: true,
            tableName: true,
            displayName: true,
          },
        },
      },
    });

    return relation;
  }
}
