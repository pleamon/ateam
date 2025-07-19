# 服务层架构说明

## 概述

本项目采用了分层架构设计，将业务逻辑从路由层分离到服务层，实现了更好的代码组织和可维护性。

## 架构层次

```
┌─────────────────┐
│   Routes Layer  │  ← 路由层：处理HTTP请求和响应
├─────────────────┤
│ Services Layer  │  ← 服务层：业务逻辑处理
├─────────────────┤
│  Prisma Client  │  ← 数据访问层：数据库操作
└─────────────────┘
```

## 服务层结构

### 1. ProjectService (`src/services/project.service.ts`)

- **功能**: 项目管理相关业务逻辑
- **主要方法**:
  - `getAllProjects()` - 获取所有项目
  - `getProjectById(id)` - 根据ID获取项目
  - `createProject(data)` - 创建项目
  - `updateProject(id, data)` - 更新项目
  - `deleteProject(id)` - 删除项目
  - `getProjectStats(projectId)` - 获取项目统计信息

### 2. TeamService (`src/services/team.service.ts`)

- **功能**: 团队管理相关业务逻辑
- **主要方法**:
  - `getAllTeams()` - 获取所有团队
  - `getTeamById(id)` - 根据ID获取团队
  - `createTeam(data)` - 创建团队
  - `updateTeam(id, data)` - 更新团队
  - `deleteTeam(id)` - 删除团队
  - `addTeamMember(teamId, data)` - 添加团队成员
  - `getTeamMembers(teamId)` - 获取团队成员
  - `getTeamStats(teamId)` - 获取团队统计信息

### 3. TaskService (`src/services/task.service.ts`)

- **功能**: 任务管理相关业务逻辑
- **主要方法**:
  - `getAllTasks()` - 获取所有任务
  - `getTaskById(id)` - 根据ID获取任务
  - `createTask(data)` - 创建任务
  - `updateTask(id, data)` - 更新任务
  - `deleteTask(id)` - 删除任务
  - `assignTask(taskId, teamMemberId)` - 分配任务
  - `addTaskActivity(taskId, body)` - 添加任务活动
  - `getProjectTasks(projectId)` - 获取项目任务
  - `getTaskStats(projectId?)` - 获取任务统计信息

### 4. SprintService (`src/services/sprint.service.ts`)

- **功能**: Sprint管理相关业务逻辑
- **主要方法**:
  - `getAllSprints()` - 获取所有Sprint
  - `getSprintById(id)` - 根据ID获取Sprint
  - `createSprint(data)` - 创建Sprint
  - `updateSprint(id, data)` - 更新Sprint
  - `deleteSprint(id)` - 删除Sprint
  - `getProjectSprints(projectId)` - 获取项目Sprint
  - `getSprintStats(projectId?)` - 获取Sprint统计信息
  - `getActiveSprint(projectId)` - 获取活跃Sprint

### 5. DocumentationService (`src/services/documentation.service.ts`)

- **功能**: 文档管理相关业务逻辑
- **主要方法**:
  - `getAllDocumentation()` - 获取所有文档
  - `getDocumentationById(id)` - 根据ID获取文档
  - `createDocumentation(data)` - 创建文档
  - `updateDocumentation(id, data)` - 更新文档
  - `deleteDocumentation(id)` - 删除文档
  - `createRequirement(data)` - 创建需求
  - `getProjectRequirements(projectId)` - 获取项目需求
  - `createRequirementQuestion(data)` - 创建需求问题
  - `getProjectQuestions(projectId)` - 获取项目问题
  - `createDomainKnowledge(data)` - 创建领域知识
  - `getProjectDomainKnowledge(projectId)` - 获取项目领域知识
  - `getDocumentationStats(projectId?)` - 获取文档统计信息

## 设计原则

### 1. 单一职责原则

每个服务类只负责一个业务领域的逻辑处理。

### 2. 依赖注入

服务层通过Prisma客户端进行数据访问，实现了数据访问层的解耦。

### 3. 错误处理

所有服务方法都包含完整的错误处理机制，确保异常能够正确传播到路由层。

### 4. 数据验证

使用Zod进行请求数据验证，确保数据的完整性和正确性。

### 5. 统一响应格式

所有服务方法都返回统一的响应格式：

```typescript
{
  success: boolean;
  data?: any;
  message?: string;
}
```

## 路由层重构

路由层现在变得非常简洁，只负责：

1. 接收HTTP请求
2. 调用相应的服务方法
3. 处理响应和错误

### 重构前后对比

**重构前** (路由包含业务逻辑):

```typescript
fastify.get('/projects', async (request, reply) => {
  try {
    const projects = await prisma.project.findMany({
      include: { tasks: true, documentation: true },
    });
    return reply.send({ success: true, data: projects });
  } catch (error) {
    return reply
      .status(500)
      .send({ success: false, message: '获取项目列表失败' });
  }
});
```

**重构后** (路由只负责调用服务):

```typescript
fastify.get('/projects', async (request, reply) => {
  try {
    const result = await ProjectService.getAllProjects();
    return reply.send(result);
  } catch (error) {
    return reply.status(500).send({
      success: false,
      error: error instanceof Error ? error.message : '获取项目列表失败',
    });
  }
});
```

## 优势

1. **可维护性**: 业务逻辑集中在服务层，便于维护和修改
2. **可测试性**: 服务层可以独立测试，不依赖HTTP框架
3. **可重用性**: 服务方法可以在不同的路由中重用
4. **关注点分离**: 路由层专注于HTTP处理，服务层专注于业务逻辑
5. **代码组织**: 更清晰的代码结构和职责划分

## 使用示例

### 在路由中使用服务

```typescript
import { ProjectService } from '../services/project.service';

fastify.get('/projects', async (request, reply) => {
  try {
    const result = await ProjectService.getAllProjects();
    return reply.send(result);
  } catch (error) {
    return reply.status(500).send({
      success: false,
      error: error instanceof Error ? error.message : '获取项目列表失败',
    });
  }
});
```

### 服务方法调用

```typescript
// 创建项目
const result = await ProjectService.createProject({
  name: '新项目',
  description: '项目描述',
});

// 获取项目统计
const stats = await ProjectService.getProjectStats('project-id');
```

## 扩展指南

### 添加新的服务

1. 在 `src/services/` 目录下创建新的服务文件
2. 实现业务逻辑方法
3. 在 `src/services/index.ts` 中导出新服务
4. 在路由中使用新服务

### 添加新的业务方法

1. 在相应的服务类中添加新方法
2. 实现数据验证和错误处理
3. 在路由中调用新方法

这种架构设计使得代码更加模块化、可维护，并且便于团队协作开发。
