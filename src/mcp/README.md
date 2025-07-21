# ATeam MCP Server

## 概述

ATeam MCP Server 是一个基于 Model Context Protocol (MCP) 的服务器，为 AI Agent 提供项目管理和协作功能。

## 新增功能

### 1. 需求管理工具

- `get_requirements` - 获取项目的所有需求列表
- `get_requirement` - 根据ID获取需求详情
- `create_requirement` - 创建新需求
- `update_requirement` - 更新需求信息

### 2. 架构设计工具

- `get_architectures` - 获取项目的所有架构设计文档
- `create_architecture` - 创建架构设计文档

支持的架构类型：
- `system` - 系统架构
- `application` - 应用架构
- `data` - 数据架构
- `deployment` - 部署架构
- `security` - 安全架构
- `integration` - 集成架构

### 3. API设计工具

- `get_api_designs` - 获取项目的所有API设计文档
- `create_api_design` - 创建API设计文档

支持的HTTP方法：GET, POST, PUT, DELETE, PATCH

### 4. 脑图工具

- `get_mindmap` - 获取项目的脑图
- `create_mindmap` - 创建或更新项目脑图

### 5. 领域知识管理工具

- `get_domain_knowledge` - 获取项目的领域知识列表
- `create_domain_knowledge` - 创建领域知识条目

### 6. 数据结构设计工具

- `get_data_structures` - 获取项目的数据结构设计
- `create_data_structure` - 创建数据结构设计

支持的数据结构类型：
- `entity` - 实体
- `value_object` - 值对象
- `aggregate` - 聚合
- `dto` - 数据传输对象
- `enum` - 枚举

### 7. 权限管理工具

- `get_user_permissions` - 获取用户在项目中的权限
- `assign_project_role` - 分配项目角色给用户

支持的项目角色：owner, admin, member, viewer

## 使用示例

### 创建需求

```json
{
  "tool": "create_requirement",
  "arguments": {
    "projectId": "project-123",
    "title": "用户登录功能",
    "description": "实现用户登录功能，支持邮箱和手机号登录",
    "type": "functional",
    "priority": "high",
    "source": "client"
  }
}
```

### 创建架构设计

```json
{
  "tool": "create_architecture",
  "arguments": {
    "projectId": "project-123",
    "name": "微服务架构设计",
    "type": "system",
    "description": "基于微服务的系统架构设计",
    "content": "## 架构概览\n\n### 服务划分\n- 用户服务\n- 订单服务\n- 支付服务"
  }
}
```

### 创建API设计

```json
{
  "tool": "create_api_design",
  "arguments": {
    "projectId": "project-123",
    "name": "获取用户信息",
    "method": "GET",
    "path": "/api/users/{userId}",
    "description": "根据用户ID获取用户详细信息",
    "responseBody": {
      "id": "string",
      "name": "string",
      "email": "string"
    }
  }
}
```

### 创建脑图

```json
{
  "tool": "create_mindmap",
  "arguments": {
    "projectId": "project-123",
    "nodes": [
      {
        "id": "root",
        "text": "项目规划",
        "position": { "x": 0, "y": 0 }
      },
      {
        "id": "node1",
        "text": "需求分析",
        "parentId": "root",
        "position": { "x": 100, "y": 0 }
      }
    ]
  }
}
```

## 架构设计

MCP Server 采用模块化设计：

1. **server.ts** - MCP 服务器主类，负责注册和启动
2. **tools-definition.ts** - 工具定义，描述所有可用的工具
3. **tool-handler.ts** - 工具处理器，实现具体的业务逻辑
4. **types.ts** - TypeScript 类型定义

## 扩展指南

添加新工具的步骤：

1. 在 `tools-definition.ts` 中添加工具定义
2. 在 `types.ts` 中添加相关类型
3. 在 `tool-handler.ts` 中添加处理逻辑
4. 创建或更新相应的服务类

## 注意事项

- 所有工具都需要正确的权限验证
- 输入参数会通过 Zod schema 进行验证
- 返回结果统一使用 JSON 格式
- 错误处理应该返回明确的错误信息