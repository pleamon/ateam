import {
  Controller,
  Get,
  Post,
  Body as RequestBody,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { McpService } from './mcp.service';
import {
  JsonRpcRequestDto,
  JsonRpcResponseDto,
  McpInfoDto,
  ToolDefinitionDto,
  ToolCallResultDto,
} from './dto/mcp.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';

@ApiTags('MCP')
@Controller('mcp')
export class McpController {
  constructor(private readonly mcpService: McpService) {}

  @Get('info')
  @ApiOperation({ summary: '获取 MCP 服务器信息' })
  @ApiResponse({ status: 200, description: '返回服务器信息', type: McpInfoDto })
  getInfo(): McpInfoDto {
    return this.mcpService.getInfo();
  }

  @Get('tools')
  @ApiOperation({ summary: '获取所有 MCP 工具列表' })
  @ApiResponse({
    status: 200,
    description: '返回所有可用的 MCP 工具及其输入模式',
    schema: {
      type: 'object',
      properties: {
        tools: {
          type: 'array',
          items: { $ref: '#/components/schemas/ToolDefinitionDto' },
        },
      },
    },
  })
  getTools() {
    return this.mcpService.getTools();
  }

  @Get('tools/:toolName')
  @ApiOperation({ summary: '获取特定工具的信息' })
  @ApiParam({ name: 'toolName', description: '工具名称' })
  @ApiResponse({ status: 200, description: '返回指定工具的详细信息', type: ToolDefinitionDto })
  @ApiResponse({ status: 404, description: '工具不存在' })
  getTool(@Param('toolName') toolName: string): ToolDefinitionDto {
    return this.mcpService.getTool(toolName);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'MCP JSON-RPC 端点' })
  @ApiResponse({ status: 200, description: '处理 MCP JSON-RPC 请求', type: JsonRpcResponseDto })
  async handleJsonRpc(
    @RequestBody() request: JsonRpcRequestDto,
    @CurrentUser() user: CurrentUserData,
  ): Promise<JsonRpcResponseDto> {
    return this.mcpService.handleJsonRpcRequest(request, user.id);
  }

  @Post('tools/:toolName')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '调用指定的 MCP 工具' })
  @ApiParam({ name: 'toolName', description: '工具名称' })
  @ApiResponse({ status: 200, description: '返回工具执行结果', type: ToolCallResultDto })
  async callTool(
    @Param('toolName') toolName: string,
    @RequestBody() args: any,
    @CurrentUser() user: CurrentUserData,
  ): Promise<ToolCallResultDto> {
    try {
      const result = await this.mcpService.handleToolCall(toolName, args, user.id);
      return {
        success: !result.isError,
        result,
        error: result.isError ? result.content[0].text : undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
