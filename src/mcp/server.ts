import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { toolsDefinition } from './tools-definition.js';
import { ToolHandler } from './tool-handler.js';

class ATeamMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'ateam-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    // 设置工具列表处理器
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: toolsDefinition,
    }));

    // 设置工具调用处理器
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      return await ToolHandler.handleToolCall(name, args);
    });
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.log('MCP Server started');
  }
}

export { ATeamMCPServer };