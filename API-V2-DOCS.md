# ATeam API v2 文档

## 概述

本文档描述了 ATeam 项目管理系统的 v2 API 接口，这些接口是为了支持 MCP（Model Context Protocol）工具而设计的增强版本。

## 基础URL

```
http://localhost:3000/api
```

## 认证

大部分接口需要认证，通过 Bearer Token 进行身份验证：

```
Authorization: Bearer <token>
```

## API 接口列表

### 1. 需求管理 API

#### 获取所有需求
```http
GET /v2/requirements?projectId={projectId}
```

**响应示例**：
```json
{
  "success": true,
  "data": [],
  "message": "获取需求列表成功"
}
```

#### 创建需求
```http
POST /v2/requirements
Content-Type: application/json

{
  "projectId": "string",
  "title": "string",
  "description": "string",
  "type": "functional|non_functional|business|technical|constraint",
  "priority": "critical|high|medium|low",
  "source": "client|internal|market|regulatory|technical"
}
```

#### 更新需求
```http
PUT /v2/requirements/{id}
Content-Type: application/json

{
  "title": "string",
  "description": "string",
  "status": "draft|reviewing|approved|implementing|testing|completed|cancelled",
  "priority": "critical|high|medium|low"
}
```

### 2. 架构设计 API

#### 获取所有架构设计
```http
GET /v2/architectures?projectId={projectId}
```

#### 创建架构设计
```http
POST /v2/architectures
Content-Type: application/json

{
  "projectId": "string",
  "name": "string",
  "type": "system|application|data|deployment|security|integration",
  "description": "string",
  "content": "string"
}
```

### 3. API设计 API

#### 获取所有API设计
```http
GET /v2/api-designs?projectId={projectId}
```

#### 创建API设计
```http
POST /v2/api-designs
Content-Type: application/json

{
  "projectId": "string",
  "name": "string",
  "method": "GET|POST|PUT|DELETE|PATCH",
  "path": "string",
  "description": "string",
  "requestBody": {},
  "responseBody": {}
}
```

### 4. 脑图 API

#### 获取项目脑图
```http
GET /v2/projects/{projectId}/mindmap
```

#### 创建或更新脑图
```http
POST /v2/mindmaps
Content-Type: application/json

{
  "projectId": "string",
  "content": "string",
  "nodes": [
    {
      "id": "string",
      "text": "string",
      "parentId": "string",
      "position": {
        "x": 0,
        "y": 0
      }
    }
  ]
}
```

### 5. 领域知识 API

#### 获取所有领域知识
```http
GET /v2/domain-knowledge?projectId={projectId}
```

#### 创建领域知识
```http
POST /v2/domain-knowledge
Content-Type: application/json

{
  "projectId": "string",
  "term": "string",
  "category": "string",
  "definition": "string",
  "context": "string",
  "examples": ["string"]
}
```

### 6. 数据结构 API

#### 获取所有数据结构
```http
GET /v2/data-structures?projectId={projectId}
```

#### 创建数据结构
```http
POST /v2/data-structures
Content-Type: application/json

{
  "projectId": "string",
  "name": "string",
  "type": "entity|value_object|aggregate|dto|enum",
  "fields": [
    {
      "name": "string",
      "type": "string",
      "required": true,
      "description": "string"
    }
  ]
}
```

### 7. 权限管理 API

#### 获取用户权限
```http
GET /v2/users/{userId}/projects/{projectId}/permissions
```

#### 分配项目角色
```http
POST /v2/project-roles
Content-Type: application/json

{
  "userId": "string",
  "projectId": "string",
  "role": "owner|admin|member|viewer"
}
```

## 错误响应格式

所有错误响应都遵循以下格式：

```json
{
  "success": false,
  "error": "错误描述信息"
}
```

## HTTP 状态码

- `200 OK`: 请求成功
- `201 Created`: 资源创建成功
- `400 Bad Request`: 请求参数错误
- `401 Unauthorized`: 未认证
- `403 Forbidden`: 无权限
- `404 Not Found`: 资源不存在
- `500 Internal Server Error`: 服务器内部错误

## MCP 工具映射

这些 API 接口与 MCP 工具的映射关系：

| MCP 工具 | API 接口 |
|---------|----------|
| get_requirements | GET /v2/requirements |
| create_requirement | POST /v2/requirements |
| update_requirement | PUT /v2/requirements/{id} |
| get_architectures | GET /v2/architectures |
| create_architecture | POST /v2/architectures |
| get_api_designs | GET /v2/api-designs |
| create_api_design | POST /v2/api-designs |
| get_mindmap | GET /v2/projects/{projectId}/mindmap |
| create_mindmap | POST /v2/mindmaps |
| get_domain_knowledge | GET /v2/domain-knowledge |
| create_domain_knowledge | POST /v2/domain-knowledge |
| get_data_structures | GET /v2/data-structures |
| create_data_structure | POST /v2/data-structures |
| get_user_permissions | GET /v2/users/{userId}/projects/{projectId}/permissions |
| assign_project_role | POST /v2/project-roles |

## 使用示例

### 创建需求
```bash
curl -X POST http://localhost:3000/api/v2/requirements \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "projectId": "123",
    "title": "用户登录功能",
    "description": "实现用户登录功能，支持邮箱和手机号",
    "type": "functional",
    "priority": "high",
    "source": "client"
  }'
```

### 创建架构设计
```bash
curl -X POST http://localhost:3000/api/v2/architectures \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "projectId": "123",
    "name": "微服务架构",
    "type": "system",
    "description": "基于微服务的系统架构设计",
    "content": "## 架构概述\n\n..."
  }'
```