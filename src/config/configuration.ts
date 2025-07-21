export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || true,
  },
  swagger: {
    title: 'ATeam API',
    description: '项目管理MCP工具API文档',
    version: '1.0.0',
    path: 'docs',
  },
  mcp: {
    enabled: process.env.MCP_ENABLED === 'true',
  },
});
