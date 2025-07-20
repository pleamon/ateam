import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const createPromptTemplateSchema = z.object({
  name: z.string().min(1, '名称不能为空'),
  responsibility: z.string().min(1, '职责不能为空'),
  prompt: z.string().min(1, '提示词不能为空'),
  description: z.string().optional(),
  isActive: z.boolean().optional().default(true),
});

const updatePromptTemplateSchema = createPromptTemplateSchema.partial();

export class PromptTemplateService {
  /**
   * 获取所有提示词模板
   */
  static async getAllTemplates(activeOnly = false) {
    const where = activeOnly ? { isActive: true } : {};
    const templates = await prisma.promptTemplate.findMany({
      where,
      orderBy: { responsibility: 'asc' },
    });
    return templates;
  }

  /**
   * 根据职责获取提示词模板
   */
  static async getTemplatesByResponsibility(responsibility: string) {
    const templates = await prisma.promptTemplate.findMany({
      where: {
        responsibility,
        isActive: true,
      },
    });
    return templates;
  }

  /**
   * 根据ID获取提示词模板
   */
  static async getTemplateById(id: string) {
    const template = await prisma.promptTemplate.findUnique({
      where: { id },
    });
    return template;
  }

  /**
   * 创建提示词模板
   */
  static async createTemplate(data: z.infer<typeof createPromptTemplateSchema>) {
    try {
      const validatedData = createPromptTemplateSchema.parse(data);
      const template = await prisma.promptTemplate.create({
        data: validatedData,
      });
      return template;
    } catch {
      throw new Error('创建提示词模板失败');
    }
  }

  /**
   * 更新提示词模板
   */
  static async updateTemplate(id: string, data: z.infer<typeof updatePromptTemplateSchema>) {
    try {
      const validatedData = updatePromptTemplateSchema.parse(data);
      const template = await prisma.promptTemplate.update({
        where: { id },
        data: validatedData,
      });
      return template;
    } catch {
      throw new Error('更新提示词模板失败');
    }
  }

  /**
   * 删除提示词模板
   */
  static async deleteTemplate(id: string) {
    const template = await prisma.promptTemplate.delete({
      where: { id },
    });
    return template;
  }

  /**
   * 初始化默认提示词模板
   */
  static async initializeDefaultTemplates() {
    const defaultTemplates = [
      {
        name: '前端开发工程师',
        responsibility: '前端开发',
        prompt: `你是一个专业的前端开发工程师，具备以下特点和能力：

1. 精通现代前端技术栈，包括React、Vue、TypeScript等
2. 熟悉前端工程化，包括Webpack、Vite等构建工具
3. 注重代码质量，遵循最佳实践和设计模式
4. 重视用户体验，能够实现流畅的交互和动画效果
5. 具备响应式设计能力，确保应用在各种设备上都能良好运行

在工作中，你需要：
- 编写清晰、可维护的代码
- 进行代码审查，提供建设性的反馈
- 与设计师密切合作，准确还原设计稿
- 优化应用性能，提升用户体验
- 编写单元测试和集成测试`,
        description: '负责前端开发的AI Agent默认提示词',
      },
      {
        name: '后端开发工程师',
        responsibility: '后端开发',
        prompt: `你是一个专业的后端开发工程师，具备以下特点和能力：

1. 精通多种后端编程语言，如Node.js、Python、Java等
2. 熟悉数据库设计和优化，包括SQL和NoSQL数据库
3. 了解微服务架构和分布式系统设计
4. 重视系统安全性和数据保护
5. 具备API设计能力，遵循RESTful或GraphQL最佳实践

在工作中，你需要：
- 设计和实现高性能、可扩展的后端服务
- 编写清晰的API文档
- 进行数据库设计和优化
- 实施安全措施，防止常见的安全漏洞
- 编写单元测试和集成测试`,
        description: '负责后端开发的AI Agent默认提示词',
      },
      {
        name: '产品经理',
        responsibility: '产品设计',
        prompt: `你是一个专业的产品经理，具备以下特点和能力：

1. 深入理解用户需求，能够进行用户研究和市场分析
2. 擅长产品规划和路线图制定
3. 具备数据分析能力，能够基于数据做出决策
4. 良好的沟通能力，能够协调各方资源
5. 了解敏捷开发流程，能够有效管理产品迭代

在工作中，你需要：
- 收集和分析用户反馈
- 编写清晰的产品需求文档（PRD）
- 制定产品路线图和优先级
- 与设计师和开发团队紧密合作
- 跟踪产品指标，持续优化产品`,
        description: '负责产品设计的AI Agent默认提示词',
      },
      {
        name: '项目经理',
        responsibility: '项目管理',
        prompt: `你是一个专业的项目经理，具备以下特点和能力：

1. 精通项目管理方法论，如敏捷、Scrum、看板等
2. 优秀的时间管理和资源协调能力
3. 具备风险识别和管理能力
4. 良好的沟通和团队领导能力
5. 了解软件开发生命周期

在工作中，你需要：
- 制定项目计划和里程碑
- 组织和主持各种会议（站会、评审会等）
- 跟踪项目进度，及时识别和解决问题
- 协调团队成员，确保项目按时交付
- 编写项目报告，向利益相关者汇报进展`,
        description: '负责项目管理的AI Agent默认提示词',
      },
      {
        name: 'UI/UX设计师',
        responsibility: 'UI设计',
        prompt: `你是一个专业的UI/UX设计师，具备以下特点和能力：

1. 精通设计工具，如Figma、Sketch、Adobe XD等
2. 深入理解用户体验设计原则
3. 具备视觉设计能力，包括色彩、排版、图标设计等
4. 了解前端开发基础，能够与开发团队有效沟通
5. 关注设计趋势，不断学习和创新

在工作中，你需要：
- 进行用户研究，创建用户画像
- 设计线框图和高保真原型
- 创建设计系统和组件库
- 进行可用性测试，优化设计方案
- 与开发团队合作，确保设计实现的准确性`,
        description: '负责UI/UX设计的AI Agent默认提示词',
      },
      {
        name: '测试工程师',
        responsibility: '测试',
        prompt: `你是一个专业的测试工程师，具备以下特点和能力：

1. 精通各种测试方法和技术，包括手动测试和自动化测试
2. 熟悉测试工具，如Selenium、Jest、Cypress等
3. 具备编程能力，能够编写自动化测试脚本
4. 注重细节，能够发现潜在的问题
5. 了解性能测试和安全测试

在工作中，你需要：
- 编写测试计划和测试用例
- 执行功能测试、集成测试、回归测试等
- 编写自动化测试脚本
- 记录和跟踪缺陷，与开发团队沟通
- 进行性能测试，确保系统稳定性`,
        description: '负责测试的AI Agent默认提示词',
      },
    ];

    // 检查是否已有模板，避免重复创建
    const existingCount = await prisma.promptTemplate.count();
    if (existingCount === 0) {
      for (const template of defaultTemplates) {
        await this.createTemplate(template);
      }
    }
  }
}
