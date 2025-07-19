# Dashboard功能总结

## 概述

Dashboard功能为项目管理系统提供了综合的数据统计和可视化功能，帮助用户快速了解项目状态、团队进度和整体运营情况。

## 功能特性

### 1. 全局仪表盘 (`/api/dashboard`)

提供系统级别的综合统计数据，包括：

#### 基础统计

- **项目总数** - 系统中所有项目的数量
- **团队总数** - 所有团队的数量
- **成员总数** - 所有团队成员的数量
- **任务总数** - 所有任务的数量
- **Sprint总数** - 所有Sprint的数量
- **文档总数** - 所有文档的数量

#### 任务统计

- **任务状态分布** - 按状态分类的任务数量
  - 待办 (todo)
  - 进行中 (in_progress)
  - 测试中 (testing)
  - 已完成 (done)
- **完成率** - 已完成任务占总任务的百分比

#### Sprint统计

- **总Sprint数** - 所有Sprint的数量
- **活跃Sprint数** - 当前活跃的Sprint数量
- **已完成Sprint数** - 已完成的Sprint数量

#### 文档统计

- **文档类型分布** - 按类型分类的文档数量
  - 概览文档 (overview)
  - 技术文档 (technical)
  - 设计文档 (design)

#### 最近数据

- **最近项目** - 最近创建的5个项目
- **最近任务** - 最近创建的10个任务
- **活跃Sprint** - 当前活跃的Sprint列表

#### 图表数据

- **任务状态分布图表** - 包含颜色配置的图表数据
- **文档类型分布图表** - 包含颜色配置的图表数据

### 2. 项目仪表盘 (`/api/dashboard/projects/:projectId`)

提供特定项目的详细统计信息，包括：

#### 项目信息

- **项目详情** - 项目的基本信息
- **关联统计** - 项目关联的任务、文档、Sprint数量

#### 项目任务统计

- **任务状态分布** - 项目内任务的状态分布
- **完成率** - 项目任务的完成率

#### 项目Sprint统计

- **Sprint状态分布** - 项目内Sprint的状态分布

#### 项目文档统计

- **文档类型分布** - 项目内文档的类型分布

#### 最近数据

- **最近任务** - 项目内最近创建的任务
- **活跃Sprint** - 项目内当前活跃的Sprint

## 技术实现

### 服务层架构

```typescript
// DashboardService
class DashboardService {
  // 获取全局仪表盘数据
  static async getDashboardStats();

  // 获取项目仪表盘数据
  static async getProjectDashboard(projectId: string);
}
```

### 数据查询优化

- **并行查询** - 使用Promise.all并行执行多个数据库查询
- **关联查询** - 通过Prisma的include功能获取关联数据
- **统计计算** - 实时计算完成率等统计数据

### API响应格式

```json
{
    "success": true,
    "data": {
        "overview": {
            "projectCount": 2,
            "teamCount": 2,
            "memberCount": 1,
            "totalTasks": 2,
            "totalSprints": 1,
            "totalDocs": 1
        },
        "taskStats": {
            "total": 2,
            "todo": 1,
            "inProgress": 1,
            "testing": 0,
            "done": 0,
            "completionRate": 0
        },
        "sprintStats": {
            "total": 1,
            "active": 0,
            "completed": 0
        },
        "docStats": {
            "total": 1,
            "overview": 0,
            "technical": 1,
            "design": 0
        },
        "recent": {
            "projects": [...],
            "tasks": [...],
            "activeSprints": [...]
        },
        "charts": {
            "taskStatusDistribution": [...],
            "docTypeDistribution": [...]
        }
    }
}
```

## MCP集成

Dashboard功能已集成到MCP Server中，提供以下工具：

### 1. get_dashboard_stats

- **描述**: 获取仪表盘统计数据，包括项目、团队、任务、Sprint和文档的统计信息
- **参数**: 无
- **返回**: 完整的仪表盘统计数据

### 2. get_project_dashboard

- **描述**: 获取特定项目的仪表盘数据，包括项目详情、任务统计、Sprint统计和文档统计
- **参数**:
  - `projectId` (string): 项目ID
- **返回**: 项目级别的仪表盘数据

## 使用场景

### 1. 项目管理

- 快速了解项目整体进度
- 监控任务完成情况
- 查看团队工作状态

### 2. 团队管理

- 了解团队成员分布
- 监控团队工作负载
- 评估团队效率

### 3. 决策支持

- 基于数据做出项目决策
- 识别项目瓶颈和风险
- 优化资源分配

### 4. 报告生成

- 生成项目状态报告
- 创建团队绩效报告
- 提供管理层汇报数据

## 扩展功能

### 未来计划

1. **实时更新** - 通过WebSocket实现实时数据更新
2. **自定义图表** - 支持用户自定义图表类型
3. **数据导出** - 支持导出统计数据为Excel/PDF
4. **告警功能** - 基于统计数据的智能告警
5. **趋势分析** - 历史数据趋势分析

### 性能优化

1. **缓存机制** - 对频繁查询的数据进行缓存
2. **分页查询** - 对大量数据进行分页处理
3. **索引优化** - 优化数据库查询索引
4. **异步处理** - 对复杂统计进行异步计算

## 总结

Dashboard功能为项目管理系统提供了强大的数据分析和可视化能力，帮助用户更好地理解项目状态、团队进度和整体运营情况。通过REST API和MCP Server的双重支持，为前端应用和AI助手提供了丰富的数据接口，实现了数据驱动的项目管理。
