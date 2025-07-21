import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsArray,
  IsNumber,
  IsBoolean,
} from 'class-validator';

export enum DatabaseEngine {
  MYSQL = 'MYSQL',
  POSTGRESQL = 'POSTGRESQL',
  SQLITE = 'SQLITE',
  MONGODB = 'MONGODB',
  REDIS = 'REDIS',
  ELASTICSEARCH = 'ELASTICSEARCH',
}

export enum ColumnType {
  INT = 'INT',
  BIGINT = 'BIGINT',
  DECIMAL = 'DECIMAL',
  FLOAT = 'FLOAT',
  DOUBLE = 'DOUBLE',
  VARCHAR = 'VARCHAR',
  CHAR = 'CHAR',
  TEXT = 'TEXT',
  LONGTEXT = 'LONGTEXT',
  DATE = 'DATE',
  TIME = 'TIME',
  DATETIME = 'DATETIME',
  TIMESTAMP = 'TIMESTAMP',
  BINARY = 'BINARY',
  VARBINARY = 'VARBINARY',
  BLOB = 'BLOB',
  BOOLEAN = 'BOOLEAN',
  JSON = 'JSON',
  UUID = 'UUID',
  ENUM = 'ENUM',
}

export enum IndexType {
  PRIMARY = 'PRIMARY',
  UNIQUE = 'UNIQUE',
  INDEX = 'INDEX',
  FULLTEXT = 'FULLTEXT',
  SPATIAL = 'SPATIAL',
}

export enum RelationType {
  ONE_TO_ONE = 'ONE_TO_ONE',
  ONE_TO_MANY = 'ONE_TO_MANY',
  MANY_TO_ONE = 'MANY_TO_ONE',
  MANY_TO_MANY = 'MANY_TO_MANY',
}

export class CreateDatabaseSchemaDto {
  @ApiProperty({ description: '数据库名称' })
  @IsString()
  schemaName: string;

  @ApiProperty({ enum: DatabaseEngine })
  @IsEnum(DatabaseEngine)
  engine: DatabaseEngine;

  @ApiProperty({ description: '项目ID' })
  @IsUUID()
  projectId: string;

  @ApiPropertyOptional({ description: '字符集', default: 'utf8mb4' })
  @IsOptional()
  @IsString()
  charset?: string;

  @ApiPropertyOptional({ description: '排序规则', default: 'utf8mb4_unicode_ci' })
  @IsOptional()
  @IsString()
  collation?: string;

  @ApiPropertyOptional({ description: '描述' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateDatabaseTableDto {
  @ApiProperty({ description: '表名' })
  @IsString()
  tableName: string;

  @ApiProperty({ description: '显示名称' })
  @IsString()
  displayName: string;

  @ApiPropertyOptional({ description: '描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '存储引擎' })
  @IsOptional()
  @IsString()
  engine?: string;

  @ApiPropertyOptional({ description: '字符集' })
  @IsOptional()
  @IsString()
  charset?: string;

  @ApiPropertyOptional({ description: '排序规则' })
  @IsOptional()
  @IsString()
  collation?: string;

  @ApiPropertyOptional({ description: '自增起始值' })
  @IsOptional()
  @IsNumber()
  autoIncrement?: number;

  @ApiPropertyOptional({ description: '表注释' })
  @IsOptional()
  @IsString()
  comment?: string;
}

export class CreateTableColumnDto {
  @ApiProperty({ description: '列名' })
  @IsString()
  columnName: string;

  @ApiProperty({ description: '显示名称' })
  @IsString()
  displayName: string;

  @ApiProperty({ enum: ColumnType })
  @IsEnum(ColumnType)
  columnType: ColumnType;

  @ApiPropertyOptional({ description: '长度' })
  @IsOptional()
  @IsNumber()
  length?: number;

  @ApiPropertyOptional({ description: '精度（小数总位数）' })
  @IsOptional()
  @IsNumber()
  precision?: number;

  @ApiPropertyOptional({ description: '标度（小数位数）' })
  @IsOptional()
  @IsNumber()
  scale?: number;

  @ApiPropertyOptional({ description: '是否主键', default: false })
  @IsOptional()
  @IsBoolean()
  isPrimaryKey?: boolean;

  @ApiPropertyOptional({ description: '是否可空', default: true })
  @IsOptional()
  @IsBoolean()
  isNullable?: boolean;

  @ApiPropertyOptional({ description: '是否唯一', default: false })
  @IsOptional()
  @IsBoolean()
  isUnique?: boolean;

  @ApiPropertyOptional({ description: '是否自增', default: false })
  @IsOptional()
  @IsBoolean()
  isAutoIncrement?: boolean;

  @ApiPropertyOptional({ description: '默认值' })
  @IsOptional()
  @IsString()
  defaultValue?: string;

  @ApiPropertyOptional({ description: '注释' })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiPropertyOptional({ description: '枚举值', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  enumValues?: string[];

  @ApiPropertyOptional({ description: '是否外键', default: false })
  @IsOptional()
  @IsBoolean()
  isForeignKey?: boolean;

  @ApiPropertyOptional({ description: '引用表' })
  @IsOptional()
  @IsString()
  referencedTable?: string;

  @ApiPropertyOptional({ description: '引用列' })
  @IsOptional()
  @IsString()
  referencedColumn?: string;

  @ApiPropertyOptional({ description: '删除时的操作' })
  @IsOptional()
  @IsString()
  onDelete?: string;

  @ApiPropertyOptional({ description: '更新时的操作' })
  @IsOptional()
  @IsString()
  onUpdate?: string;

  @ApiProperty({ description: '列的位置' })
  @IsNumber()
  position: number;
}
