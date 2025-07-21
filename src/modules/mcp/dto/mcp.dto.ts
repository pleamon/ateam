import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject } from 'class-validator';

export class JsonRpcRequestDto {
  @ApiProperty({ description: 'JSON-RPC 版本', example: '2.0' })
  @IsString()
  jsonrpc: string;

  @ApiProperty({ description: '方法名' })
  @IsString()
  method: string;

  @ApiPropertyOptional({ description: '参数' })
  @IsOptional()
  @IsObject()
  params?: any;

  @ApiPropertyOptional({ description: '请求ID' })
  @IsOptional()
  id?: string | number;
}

export class ToolCallParamsDto {
  @ApiProperty({ description: '工具名称' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: '工具参数' })
  @IsOptional()
  @IsObject()
  arguments?: any;
}

export class ToolResponseDto {
  @ApiProperty({
    description: '响应内容',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        type: { type: 'string', example: 'text' },
        text: { type: 'string' },
      },
    },
  })
  content: Array<{
    type: 'text';
    text: string;
  }>;

  @ApiPropertyOptional({ description: '是否错误' })
  @IsOptional()
  isError?: boolean;
}

export class JsonRpcResponseDto {
  @ApiProperty({ description: 'JSON-RPC 版本', example: '2.0' })
  jsonrpc: string;

  @ApiPropertyOptional({ description: '结果' })
  result?: any;

  @ApiPropertyOptional({ description: '错误信息' })
  error?: {
    code: number;
    message: string;
    data?: any;
  };

  @ApiPropertyOptional({ description: '请求ID' })
  id?: string | number | null;
}

export class ToolDefinitionDto {
  @ApiProperty({ description: '工具名称' })
  name: string;

  @ApiProperty({ description: '工具描述' })
  description: string;

  @ApiProperty({ description: '输入模式' })
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

export class McpInfoDto {
  @ApiProperty({ description: '服务器名称' })
  name: string;

  @ApiProperty({ description: '版本号' })
  version: string;

  @ApiProperty({ description: '服务器能力' })
  capabilities: {
    tools: boolean;
    resources: boolean;
    prompts: boolean;
  };
}

export class ToolCallResultDto {
  @ApiProperty({ description: '操作是否成功' })
  success: boolean;

  @ApiPropertyOptional({ description: '结果数据' })
  result?: ToolResponseDto;

  @ApiPropertyOptional({ description: '错误信息' })
  error?: string;
}
