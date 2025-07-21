import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsArray,
  IsObject,
  IsNumber,
  IsBoolean,
} from 'class-validator';

export enum ApiMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  OPTIONS = 'OPTIONS',
  HEAD = 'HEAD',
}

export enum ApiContentType {
  APPLICATION_JSON = 'APPLICATION_JSON',
  APPLICATION_XML = 'APPLICATION_XML',
  APPLICATION_FORM_URLENCODED = 'APPLICATION_FORM_URLENCODED',
  MULTIPART_FORM_DATA = 'MULTIPART_FORM_DATA',
  TEXT_PLAIN = 'TEXT_PLAIN',
}

export enum ApiAuthType {
  NONE = 'NONE',
  BASIC = 'BASIC',
  BEARER = 'BEARER',
  API_KEY = 'API_KEY',
  OAUTH2 = 'OAUTH2',
  CUSTOM = 'CUSTOM',
}

export enum ApiStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  DEPRECATED = 'DEPRECATED',
  RETIRED = 'RETIRED',
}

export class CreateApiDesignDto {
  @ApiProperty({ description: 'API名称' })
  @IsString()
  apiName: string;

  @ApiProperty({ description: 'API路径' })
  @IsString()
  apiPath: string;

  @ApiProperty({ enum: ApiMethod })
  @IsEnum(ApiMethod)
  apiMethod: ApiMethod;

  @ApiPropertyOptional({ description: 'API版本', default: '1.0.0' })
  @IsOptional()
  @IsString()
  apiVersion?: string;

  @ApiProperty({ description: '所属平台' })
  @IsString()
  platform: string;

  @ApiPropertyOptional({ description: '所属模块' })
  @IsOptional()
  @IsString()
  module?: string;

  @ApiProperty({ description: 'API描述' })
  @IsString()
  apiDescription: string;

  @ApiPropertyOptional({ description: '业务逻辑说明' })
  @IsOptional()
  @IsString()
  businessLogic?: string;

  @ApiProperty({ description: '项目ID' })
  @IsUUID()
  projectId: string;

  @ApiPropertyOptional({ enum: ApiContentType, default: ApiContentType.APPLICATION_JSON })
  @IsOptional()
  @IsEnum(ApiContentType)
  apiContentType?: ApiContentType;

  @ApiPropertyOptional({ description: '请求头定义' })
  @IsOptional()
  @IsObject()
  requestHeaders?: any;

  @ApiPropertyOptional({ description: '请求参数定义' })
  @IsOptional()
  @IsObject()
  requestParams?: any;

  @ApiPropertyOptional({ description: '请求体定义' })
  @IsOptional()
  @IsObject()
  requestBody?: any;

  @ApiPropertyOptional({ description: '响应头定义' })
  @IsOptional()
  @IsObject()
  responseHeaders?: any;

  @ApiPropertyOptional({ description: '响应体定义' })
  @IsOptional()
  @IsObject()
  responseBody?: any;

  @ApiPropertyOptional({ enum: ApiAuthType, default: ApiAuthType.NONE })
  @IsOptional()
  @IsEnum(ApiAuthType)
  authentication?: ApiAuthType;

  @ApiPropertyOptional({ description: '认证详情' })
  @IsOptional()
  @IsObject()
  authDetails?: any;

  @ApiPropertyOptional({ description: '所需权限', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];

  @ApiPropertyOptional({ description: '速率限制（请求/分钟）' })
  @IsOptional()
  @IsNumber()
  rateLimit?: number;

  @ApiPropertyOptional({ description: '超时时间（毫秒）' })
  @IsOptional()
  @IsNumber()
  timeout?: number;

  @ApiPropertyOptional({ description: '最大载荷大小（字节）' })
  @IsOptional()
  @IsNumber()
  maxPayloadSize?: number;

  @ApiPropertyOptional({ enum: ApiStatus, default: ApiStatus.DRAFT })
  @IsOptional()
  @IsEnum(ApiStatus)
  status?: ApiStatus;
}

export class CreateApiExampleDto {
  @ApiProperty({ description: '示例名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '示例描述' })
  @IsString()
  description: string;

  @ApiProperty({ description: '完整请求URL' })
  @IsString()
  requestUrl: string;

  @ApiPropertyOptional({ description: '请求头示例' })
  @IsOptional()
  @IsObject()
  requestHeaders?: any;

  @ApiPropertyOptional({ description: '请求参数示例' })
  @IsOptional()
  @IsObject()
  requestParams?: any;

  @ApiPropertyOptional({ description: '请求体示例' })
  @IsOptional()
  @IsObject()
  requestBody?: any;

  @ApiProperty({ description: '响应状态码' })
  @IsNumber()
  responseStatus: number;

  @ApiPropertyOptional({ description: '响应头示例' })
  @IsOptional()
  @IsObject()
  responseHeaders?: any;

  @ApiPropertyOptional({ description: '响应体示例' })
  @IsOptional()
  @IsObject()
  responseBody?: any;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: '是否成功示例', default: true })
  @IsOptional()
  @IsBoolean()
  isSuccess?: boolean;
}
