import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/prisma/prisma.service';
import { CreatePromptTemplateDto, UpdatePromptTemplateDto } from './dto/prompt-template.dto';
import { PermissionService } from '../auth/permission.service';

@Injectable()
export class PromptTemplateService {
  constructor(
    private prisma: PrismaService,
    private permissionService: PermissionService,
  ) { }

  private readonly defaultTemplates = [
    {
      name: '前端开发工程师',
      responsibility: '前端开发',
      prompt: `你是一位经验丰富的前端开发工程师。你的职责包括：
1. 设计和实现用户界面，确保良好的用户体验
2. 使用React、Vue或Angular等现代前端框架开发应用
3. 编写高质量、可维护的前端代码
4. 优化前端性能，确保应用快速响应
5. 与后端开发人员协作，集成API和数据
6. 进行跨浏览器兼容性测试
7. 实现响应式设计，支持多种设备`,
    },
    {
      name: '后端开发工程师',
      responsibility: '后端开发',
      prompt: `你是一位资深的后端开发工程师。你的职责包括：
1. 设计和实现RESTful API和微服务架构
2. 开发高性能、可扩展的后端服务
3. 设计和优化数据库结构
4. 实现安全认证和授权机制
5. 编写单元测试和集成测试
6. 优化系统性能和资源使用
7. 与前端开发人员协作，提供API文档和支持`,
    },
    {
      name: '产品经理',
      responsibility: '产品管理',
      prompt: `你是一位经验丰富的产品经理。你的职责包括：
1. 收集和分析用户需求，定义产品功能
2. 编写详细的产品需求文档（PRD）
3. 制定产品路线图和发布计划
4. 与开发团队沟通，确保需求正确实现
5. 进行市场调研和竞品分析
6. 跟踪产品指标，持续优化产品
7. 协调各方资源，推动产品按时上线`,
    },
    {
      name: '项目经理',
      responsibility: '项目管理',
      prompt: `你是一位专业的项目经理。你的职责包括：
1. 制定项目计划和时间表
2. 分配任务和资源，跟踪项目进度
3. 识别和管理项目风险
4. 协调团队成员，促进有效沟通
5. 组织项目会议，包括每日站会和回顾会议
6. 管理项目预算和成本
7. 向干系人汇报项目状态`,
    },
    {
      name: 'UI/UX设计师',
      responsibility: 'UI/UX设计',
      prompt: `你是一位富有创意的UI/UX设计师。你的职责包括：
1. 进行用户研究，理解用户需求和行为
2. 创建用户画像和用户旅程图
3. 设计产品原型和线框图
4. 创建视觉设计，包括配色、图标和界面元素
5. 制定设计规范和组件库
6. 进行可用性测试，优化用户体验
7. 与开发团队协作，确保设计正确实现`,
    },
    {
      name: '测试工程师',
      responsibility: '质量保证',
      prompt: `你是一位细致的测试工程师。你的职责包括：
1. 编写测试计划和测试用例
2. 执行功能测试、集成测试和回归测试
3. 进行性能测试和压力测试
4. 发现和报告软件缺陷
5. 编写自动化测试脚本
6. 验证bug修复，确保质量标准
7. 参与需求评审，提供测试建议`,
    },
  ];

  async create(createDto: CreatePromptTemplateDto, userId: string) {
    const template = await this.prisma.agentPromptTemplate.create({
      data: createDto,
    });

    // 记录审计日志
    await this.permissionService.logAction(
      userId,
      'PROMPT_TEMPLATE_CREATE',
      'PROMPT_TEMPLATE',
      template.id,
      { templateName: template.name },
    );

    return template;
  }

  async findAll(onlyActive = false) {
    const templates = await this.prisma.agentPromptTemplate.findMany({
      where: onlyActive ? { isActive: true } : undefined,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return templates;
  }

  async findByResponsibility(responsibility: string) {
    const templates = await this.prisma.agentPromptTemplate.findMany({
      where: {
        responsibility,
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return templates;
  }

  async findOne(id: string) {
    const template = await this.prisma.agentPromptTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new Error('模板不存在');
    }

    return template;
  }

  async update(id: string, updateDto: UpdatePromptTemplateDto, userId: string) {
    const template = await this.prisma.agentPromptTemplate.update({
      where: { id },
      data: updateDto,
    });

    // 记录审计日志
    await this.permissionService.logAction(
      userId,
      'PROMPT_TEMPLATE_UPDATE',
      'PROMPT_TEMPLATE',
      id,
      { changes: updateDto },
    );

    return template;
  }

  async remove(id: string, userId: string) {
    await this.prisma.agentPromptTemplate.delete({
      where: { id },
    });

    // 记录审计日志
    await this.permissionService.logAction(userId, 'PROMPT_TEMPLATE_DELETE', 'PROMPT_TEMPLATE', id);

    return { message: '模板删除成功' };
  }

  async initializeDefaults(userId: string) {
    const existingTemplates = await this.prisma.agentPromptTemplate.count();

    if (existingTemplates > 0) {
      return { message: '默认模板已存在' };
    }

    const templates = await this.prisma.agentPromptTemplate.createMany({
      data: this.defaultTemplates,
    });

    // 记录审计日志
    await this.permissionService.logAction(
      userId,
      'PROMPT_TEMPLATE_INITIALIZE',
      'PROMPT_TEMPLATE',
      'default',
      { count: templates.count },
    );

    return {
      message: '默认模板初始化成功',
      count: templates.count,
    };
  }
}
