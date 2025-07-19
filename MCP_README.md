# ATeam MCP Server 使用说明

## 概述

ATeam MCP Server 是一个基于 Model Context Protocol (MCP) 的服务器，为AI助手提供了访问项目管理系统的能力。通过MCP协议，AI助手可以直接调用项目管理功能，如创建项目、管理团队、分配任务等。

## 功能特性

### 🏗️ 项目管理

- **get_projects**: 获取所有项目列表
- **get_project**: 根据ID获取项目详情
- **create_project**: 创建新项目
- **update_project**: 更新项目信息
- **delete_project**: 删除项目

### 👥 团队管理

- **get_teams**: 获取所有团队列表
- **get_team**: 根据ID获取团队详情
- **create_team**: 创建新团队

### 📋 任务管理

- **get_tasks**: 获取所有任务列表
- **get_task**: 根据ID获取任务详情
- **create_task**: 创建新任务
- **update_task**: 更新任务信息

### 🏃 Sprint管理

- **get_sprints**: 获取所有Sprint列表
- **create_sprint**: 创建新Sprint

### 📚 文档管理

- **get_documentation**: 获取所有文档列表
- **create_documentation**: 创建新文档

### 📊 统计分析

- **get_project_stats**: 获取项目统计信息
- **get_task_stats**: 获取任务统计信息

## 安装和配置

### 1. 安装依赖

```bash
pnpm install
```

### 2. 构建项目

```bash
npm run build
```

### 3. 配置数据库

确保你的数据库连接配置正确，在 `.env` 文件中设置：

```
DATABASE_URL="postgresql://username:password@localhost:5432/ateam"
```

### 4. 生成Prisma客户端

```bash
npm run db:generate
```

## 使用方法

### 启动MCP Server

#### 开发模式

```bash
npm run mcp:dev
```

#### 生产模式

```bash
npm run mcp:start
```

### 测试MCP功能

```bash
npm run mcp:test
```

## MCP配置

在你的MCP客户端配置文件中添加：

```json
{
  "mcpServers": {
    "ateam": {
      "command": "node",
      "args": ["dist/mcp/index.js"],
      "env": {
        "DATABASE_URL": "postgresql://username:password@localhost:5432/ateam"
      }
    }
  }
}
```

## 工具详细说明

### 项目管理工具

#### get_projects

获取所有项目列表

```json
{
  "name": "get_projects",
  "arguments": {}
}
```

#### create_project

创建新项目

```json
{
  "name": "create_project",
  "arguments": {
    "name": "项目名称",
    "description": "项目描述（可选）"
  }
}
```

#### get_project

获取项目详情

```json
{
  "name": "get_project",
  "arguments": {
    "projectId": "项目ID"
  }
}
```

### 团队管理工具

#### create_team

创建新团队

```json
{
  "name": "create_team",
  "arguments": {
    "name": "团队名称",
    "description": "团队描述（可选）"
  }
}
```

#### get_teams

获取所有团队列表

```json
{
  "name": "get_teams",
  "arguments": {}
}
```

### 任务管理工具

#### create_task

创建新任务

```json
{
  "name": "create_task",
  "arguments": {
    "projectId": "项目ID",
    "teamId": "团队ID",
    "title": "任务标题",
    "content": "任务内容（可选）",
    "status": "todo|in_progress|testing|done"
  }
}
```

#### update_task

更新任务信息

```json
{
  "name": "update_task",
  "arguments": {
    "taskId": "任务ID",
    "title": "新标题（可选）",
    "content": "新内容（可选）",
    "status": "新状态（可选）"
  }
}
```

### Sprint管理工具

#### create_sprint

创建新Sprint

```json
{
  "name": "create_sprint",
  "arguments": {
    "projectId": "项目ID",
    "name": "Sprint名称",
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": "2024-01-15T00:00:00Z",
    "goal": "Sprint目标"
  }
}
```

### 文档管理工具

#### create_documentation

创建新文档

```json
{
  "name": "create_documentation",
  "arguments": {
    "projectId": "项目ID",
    "teamId": "团队ID",
    "name": "文档名称",
    "content": "文档内容",
    "type": "overview|technical|design|research|other"
  }
}
```

### 统计分析工具

#### get_project_stats

获取项目统计信息

```json
{
  "name": "get_project_stats",
  "arguments": {
    "projectId": "项目ID"
  }
}
```

#### get_task_stats

获取任务统计信息

```json
{
  "name": "get_task_stats",
  "arguments": {
    "projectId": "项目ID（可选）"
  }
}
```

## 响应格式

所有工具调用都会返回统一的响应格式：

### 成功响应

```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"success\":true,\"data\":{...},\"message\":\"操作成功\"}"
    }
  ]
}
```

### 错误响应

```json
{
  "content": [
    {
      "type": "text",
      "text": "Error: 错误信息"
    }
  ],
  "isError": true
}
```

## 开发指南

### 添加新工具

1. 在 `src/mcp/server.ts` 中添加工具定义
2. 在 `src/mcp/types.ts` 中添加类型定义
3. 实现工具处理逻辑
4. 更新测试文件

### 工具命名规范

- 使用下划线分隔的小写字母
- 动词\_名词的格式
- 例如：`create_project`, `get_teams`, `update_task`

### 错误处理

所有工具都应该包含适当的错误处理：

```typescript
try {
  const result = await Service.method(args);
  return {
    content: [{ type: 'text', text: JSON.stringify(result) }],
  };
} catch (error) {
  return {
    content: [{ type: 'text', text: `Error: ${error.message}` }],
    isError: true,
  };
}
```

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查 `DATABASE_URL` 配置
   - 确保数据库服务正在运行

2. **MCP Server启动失败**
   - 检查依赖是否正确安装
   - 确保TypeScript编译成功

3. **工具调用失败**
   - 检查参数格式是否正确
   - 查看服务器日志获取详细错误信息

### 调试模式

启动调试模式以获取详细日志：

```bash
npm run mcp:dev
```

## 许可证

本项目采用 MIT 许可证。

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目。
