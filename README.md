<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ pnpm install
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ pnpm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

# ATeam - 项目管理MCP工具后端

这是一个基于Fastify框架的项目管理MCP工具后端，提供完整的项目管理功能。

## 功能特性

- 🚀 **Fastify框架** - 高性能的Node.js Web框架
- 📊 **Prisma ORM** - 类型安全的数据库操作
- 📚 **Swagger API文档** - 自动生成的API文档
- 🛡️ **安全中间件** - CORS和Helmet安全防护
- ✅ **请求验证** - 使用Zod进行类型验证
- 🏗️ **模块化架构** - 清晰的路由和服务分离

## 数据模型

### 核心实体

- **Project** - 项目管理
- **Team** - 团队管理
- **Task** - 任务管理
- **Sprint** - 敏捷冲刺
- **Documentation** - 文档管理

### 扩展功能

- **Requirement** - 需求管理
- **DomainKnowledge** - 领域知识
- **SystemArchitecture** - 系统架构
- **TeamMember** - 团队成员

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 环境配置

创建 `.env` 文件：

```env
# 数据库连接
DATABASE_URL="postgresql://username:password@localhost:5432/ateam?schema=public"

# 服务器配置
PORT=3000
NODE_ENV=development
```

### 3. 数据库设置

```bash
# 生成Prisma客户端
pnpm db:generate

# 推送数据库schema
pnpm db:push

# 或者运行迁移
pnpm db:migrate
```

**注意**: 本项目使用单文件Prisma schema，所有模型定义都在 `prisma/schema.prisma` 文件中。虽然Prisma支持多文件schema，但在当前版本中可能存在兼容性问题，因此选择使用单文件方式确保稳定性。

### 4. 启动开发服务器

```bash
# 开发模式
pnpm start:dev

# 生产模式
pnpm start:prod
```

## API文档

启动服务器后，访问以下地址查看API文档：

- **Swagger UI**: http://localhost:3000/docs
- **健康检查**: http://localhost:3000/health

## API端点

### 项目管理

- `GET /api/projects` - 获取所有项目
- `GET /api/projects/:id` - 获取单个项目
- `POST /api/projects` - 创建项目
- `PUT /api/projects/:id` - 更新项目
- `DELETE /api/projects/:id` - 删除项目

### 团队管理

- `GET /api/teams` - 获取所有团队
- `GET /api/teams/:id` - 获取单个团队
- `POST /api/teams` - 创建团队
- `PUT /api/teams/:id` - 更新团队
- `DELETE /api/teams/:id` - 删除团队
- `POST /api/teams/:id/members` - 添加团队成员

### 仪表盘

- `GET /api/dashboard` - 获取仪表盘统计数据
- `GET /api/dashboard/projects/:projectId` - 获取项目仪表盘数据

### 路线图管理

- `GET /api/projects/:projectId/roadmaps` - 获取项目路线图
- `GET /api/roadmaps/:id` - 获取路线图详情
- `POST /api/roadmaps` - 创建路线图
- `PUT /api/roadmaps/:id` - 更新路线图
- `DELETE /api/roadmaps/:id` - 删除路线图

### 里程碑管理

- `POST /api/milestones` - 创建里程碑
- `PUT /api/milestones/:id` - 更新里程碑
- `DELETE /api/milestones/:id` - 删除里程碑

### 版本管理

- `POST /api/versions` - 创建版本
- `PUT /api/versions/:id` - 更新版本
- `DELETE /api/versions/:id` - 删除版本

### 功能管理

- `POST /api/features` - 创建功能
- `PUT /api/features/:id` - 更新功能
- `DELETE /api/features/:id` - 删除功能

### 路线图统计

- `GET /api/projects/:projectId/roadmap-stats` - 获取路线图统计信息
- `GET /api/teams/:id/members` - 获取团队成员

### 任务管理

- `GET /api/tasks` - 获取所有任务
- `GET /api/tasks/:id` - 获取单个任务
- `POST /api/tasks` - 创建任务
- `PUT /api/tasks/:id` - 更新任务
- `DELETE /api/tasks/:id` - 删除任务
- `POST /api/tasks/:id/assign` - 分配任务
- `POST /api/tasks/:id/activities` - 添加任务活动

### Sprint管理

- `GET /api/sprints` - 获取所有Sprint
- `GET /api/sprints/:id` - 获取单个Sprint
- `POST /api/sprints` - 创建Sprint
- `PUT /api/sprints/:id` - 更新Sprint
- `DELETE /api/sprints/:id` - 删除Sprint
- `GET /api/sprints/project/:projectId` - 获取项目的Sprint

### 文档管理

- `GET /api/documentation` - 获取所有文档
- `GET /api/documentation/:id` - 获取单个文档
- `POST /api/documentation` - 创建文档
- `PUT /api/documentation/:id` - 更新文档
- `DELETE /api/documentation/:id` - 删除文档
- `POST /api/documentation/requirements` - 创建需求
- `GET /api/documentation/requirements/:projectId` - 获取项目需求
- `POST /api/documentation/questions` - 创建需求问题
- `GET /api/documentation/questions/:projectId` - 获取项目问题
- `POST /api/documentation/domain-knowledge` - 创建领域知识
- `GET /api/documentation/domain-knowledge/:projectId` - 获取领域知识

## 开发

### 代码格式化

```bash
pnpm format
```

### 代码检查

```bash
pnpm lint
```

### 运行测试

```bash
# 单元测试
pnpm test

# 测试覆盖率
pnpm test:cov

# E2E测试
pnpm test:e2e
```

### 数据库管理

```bash
# 打开Prisma Studio
pnpm db:studio

# 重置数据库
pnpm db:reset
```

### MCP Server 管理

```bash
# 开发模式启动MCP Server
npm run mcp:dev

# 生产模式启动MCP Server
npm run mcp:start

# 测试MCP功能
npm run mcp:test
```

## 技术栈

- **Runtime**: Node.js
- **Framework**: Fastify
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Validation**: Zod
- **Documentation**: Swagger/OpenAPI
- **Package Manager**: pnpm

## 架构设计

项目采用分层架构设计：

- **路由层** (`src/routes/`): 处理HTTP请求和响应
- **服务层** (`src/services/`): 业务逻辑处理
- **数据访问层** (`generated/prisma/`): 数据库操作

这种设计实现了关注点分离，提高了代码的可维护性和可测试性。详细架构说明请参考 [SERVICES_ARCHITECTURE.md](./SERVICES_ARCHITECTURE.md)。

## MCP Server 功能

项目还包含一个完整的 MCP (Model Context Protocol) Server，为AI助手提供项目管理功能：

- **MCP Server** (`src/mcp/`): MCP协议服务器
- **工具集成**: 20+ 项目管理工具
- **AI助手支持**: 支持AI助手直接调用项目管理功能

详细使用说明请参考 [MCP_README.md](./MCP_README.md)。

- **Language**: TypeScript

## 项目结构

```
ateam/
├── src/
│   ├── routes/          # API路由
│   │   ├── project.ts
│   │   ├── team.ts
│   │   ├── task.ts
│   │   ├── sprint.ts
│   │   └── documentation.ts
│   ├── services/        # 业务逻辑层
│   │   ├── project.service.ts
│   │   ├── team.service.ts
│   │   ├── task.service.ts
│   │   ├── sprint.service.ts
│   │   ├── documentation.service.ts
│   │   └── index.ts
│   ├── types/          # 类型定义
│   └── main.ts         # 应用入口
├── prisma/
│   └── schema.prisma   # 数据库schema
├── generated/          # 生成的Prisma客户端
├── test/              # 测试文件
└── package.json
```

## 贡献

欢迎提交Issue和Pull Request！

## 许可证

MIT License
