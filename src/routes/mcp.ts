import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ToolHandler } from '../mcp/tool-handler.js';
import { toolsDefinition } from '../mcp/tools-definition.js';

interface JsonRpcRequest {
  jsonrpc: string;
  method: string;
  params?: any;
  id?: string | number;
}

interface ToolCallRequest {
  Body: {
    name: string;
    arguments: any;
  };
  Params: {
    toolName: string;
  };
}

const mcpRoutes = async (fastify: FastifyInstance) => {
  // MCP 信息端点
  fastify.get('/mcp/info', async () => ({
    name: 'ateam-mcp-server',
    version: '1.0.0',
    capabilities: {
      tools: true,
      resources: false,
      prompts: false,
    },
  }));

  // 列出所有工具
  fastify.get(
    '/mcp/tools',
    {
      schema: {
        summary: '获取所有 MCP 工具列表',
        description: '返回所有可用的 MCP 工具及其输入模式',
        tags: ['MCP'],
        response: {
          200: {
            type: 'object',
            properties: {
              tools: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    description: { type: 'string' },
                    inputSchema: { type: 'object' },
                  },
                },
              },
            },
          },
        },
      },
    },
    async () => ({
      tools: toolsDefinition,
    }),
  );

  // MCP JSON-RPC 端点
  fastify.post(
    '/mcp',
    {
      schema: {
        summary: 'MCP JSON-RPC 端点',
        description: '处理 MCP JSON-RPC 请求',
        tags: ['MCP'],
        body: {
          type: 'object',
          properties: {
            jsonrpc: { type: 'string' },
            method: { type: 'string' },
            params: { type: 'object' },
            id: {
              oneOf: [{ type: 'string' }, { type: 'number' }],
            },
          },
          required: ['jsonrpc', 'method'],
        },
      },
    },
    async (request: FastifyRequest<{ Body: JsonRpcRequest }>, reply: FastifyReply) => {
      const { jsonrpc, method, params, id } = request.body;

      if (jsonrpc !== '2.0') {
        return reply.code(400).send({
          jsonrpc: '2.0',
          error: {
            code: -32600,
            message: 'Invalid Request: jsonrpc must be "2.0"',
          },
          id: id || null,
        });
      }

      try {
        let result;
        switch (method) {
          case 'tools/list':
            result = { tools: toolsDefinition };
            break;
          case 'tools/call':
            if (!params || !params.name) {
              return reply.code(400).send({
                jsonrpc: '2.0',
                error: {
                  code: -32602,
                  message: 'Invalid params: missing tool name',
                },
                id,
              });
            }
            result = await ToolHandler.handleToolCall(params.name, params.arguments || {});
            break;
          default:
            return reply.code(400).send({
              jsonrpc: '2.0',
              error: {
                code: -32601,
                message: `Method not found: ${method}`,
              },
              id,
            });
        }

        return {
          jsonrpc: '2.0',
          result,
          id,
        };
      } catch (error) {
        fastify.log.error('Error handling MCP request:', error);
        return reply.code(500).send({
          jsonrpc: '2.0',
          error: {
            code: -32603,
            message: 'Internal error',
            data: error instanceof Error ? error.message : 'Unknown error',
          },
          id,
        });
      }
    },
  );

  // REST 风格的工具调用端点（方便测试）
  fastify.post(
    '/mcp/tools/:toolName',
    {
      schema: {
        summary: '调用指定的 MCP 工具',
        description: '通过 REST 接口调用 MCP 工具',
        tags: ['MCP'],
        params: {
          type: 'object',
          properties: {
            toolName: { type: 'string', description: '工具名称' },
          },
          required: ['toolName'],
        },
        body: {
          type: 'object',
          description: '工具参数',
        },
      },
    },
    async (request: FastifyRequest<ToolCallRequest>, reply: FastifyReply) => {
      const { toolName } = request.params;
      const args = request.body;

      try {
        const result = await ToolHandler.handleToolCall(toolName, args);

        return {
          success: true,
          result,
        };
      } catch (error) {
        fastify.log.error(`Error calling tool ${toolName}:`, error);
        return reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    },
  );

  // 获取特定工具的信息
  fastify.get(
    '/mcp/tools/:toolName',
    {
      schema: {
        summary: '获取特定工具的信息',
        description: '返回指定工具的详细信息',
        tags: ['MCP'],
        params: {
          type: 'object',
          properties: {
            toolName: { type: 'string', description: '工具名称' },
          },
          required: ['toolName'],
        },
      },
    },
    async (request: FastifyRequest<{ Params: { toolName: string } }>, reply: FastifyReply) => {
      const { toolName } = request.params;
      const tool = toolsDefinition.find((t) => t.name === toolName);

      if (!tool) {
        return reply.code(404).send({
          error: 'Tool not found',
          message: `Tool ${toolName} does not exist`,
        });
      }

      return tool;
    },
  );
};

export default mcpRoutes;
