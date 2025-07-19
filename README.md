# ATeam 后端服务

ATeam 后端基于 Fastify 框架构建，提供完整的项目管理 API 和 MCP Server 功能。

## 技术栈

- **Runtime**: Node.js 18+
- **Framework**: Fastify 4.x
- **Database**: PostgreSQL 15+
- **ORM**: Prisma 5.x
- **Language**: TypeScript 5.x
- **Validation**: Zod
- **Documentation**: Swagger/OpenAPI

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 环境配置

```bash
cp .env.example .env
# 编辑 .env 文件，配置数据库连接等
```

### 3. 数据库初始化

```bash
# 生成 Prisma Client
pnpm prisma:generate

# 运行数据库迁移
pnpm prisma:migrate

# （可选）填充示例数据
pnpm prisma:seed
```

### 4. 启动服务

```bash
# 开发模式（支持热重载）
pnpm dev

# 生产模式
pnpm build
pnpm start
```

服务将在 http://localhost:3001 启动

## 项目结构

```
src/
├── routes/          # API 路由定义
├── services/        # 业务逻辑层
├── mcp/            # MCP Server 实现
├── schemas/        # 数据验证模式
├── types/          # TypeScript 类型定义
├── utils/          # 工具函数
└── index.ts        # 应用入口
```

## 主要功能模块

- **项目管理**: 项目的创建、更新、删除和查询
- **团队管理**: AI Agent 团队成员管理
- **任务管理**: 任务创建、分配、状态跟踪
- **Sprint 管理**: 敏捷开发周期管理
- **文档管理**: 项目文档、需求、领域知识管理
- **仪表盘**: 项目统计和分析
- **MCP Server**: AI 助手集成接口

## API 文档

启动服务后访问：
- Swagger UI: http://localhost:3001/documentation
- 健康检查: http://localhost:3001/health

## 开发命令

```bash
# 代码检查
pnpm lint
pnpm lint:fix

# 类型检查
pnpm type-check

# 运行测试
pnpm test
pnpm test:watch
pnpm test:coverage

# 数据库工具
pnpm prisma:studio    # 打开数据库 GUI
pnpm prisma:generate  # 重新生成 Prisma Client
pnpm prisma:migrate   # 运行迁移

# MCP Server
pnpm mcp:dev     # 开发模式
pnpm mcp:start   # 生产模式
pnpm mcp:test    # 测试 MCP 功能
```

## 架构说明

项目采用分层架构：

1. **路由层** (Routes): 处理 HTTP 请求，调用服务层
2. **服务层** (Services): 包含所有业务逻辑
3. **数据层** (Prisma): 处理数据库操作

详细架构文档请参考 [架构说明](../docs/architecture/backend.md)

## MCP Server

项目包含完整的 MCP (Model Context Protocol) Server，支持 AI 助手直接调用项目管理功能。

使用方法请参考 [MCP Server 文档](../docs/architecture/mcp-server.md)

## 贡献指南

请参考项目根目录的 [贡献指南](../docs/development/contributing.md)

## 许可证

MIT License