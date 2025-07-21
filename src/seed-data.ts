import { PrismaClient } from '@generated/prisma';

const prisma = new PrismaClient();

async function seedData() {
  try {
    console.log('🌱 开始创建示例数据...');

    // 创建项目
    const project = await prisma.project.create({
      data: {
        name: 'ATeam项目管理系统',
        description: '一个基于Fastify的项目管理MCP工具',
      },
    });
    console.log('✅ 项目创建成功:', project.name);

    // 创建团队
    const team = await prisma.team.create({
      data: {
        name: '开发团队',
        description: '负责系统开发和维护',
        projectId: project.id,
      },
    });
    console.log('✅ 团队创建成功:', team.name);

    // 创建团队Agent
    const agent = await prisma.agent.create({
      data: {
        name: '开发团队Agent',
        projectId: project.id,
        teamId: team.id,
        responsibilities: ['后端开发', 'API设计'],
        skills: ['TypeScript', 'Fastify', 'Prisma'],
      },
    });
    console.log('✅ 团队Agent创建成功');

    // 创建Sprint
    const sprint = await prisma.sprint.create({
      data: {
        projectId: project.id,
        name: 'Sprint 1',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        goal: '完成基础功能开发',
        status: 'in_progress',
      },
    });
    console.log('✅ Sprint创建成功:', sprint.name);

    // 创建任务
    const task = await prisma.task.create({
      data: {
        projectId: project.id,
        sprintId: sprint.id,
        teamId: team.id,
        title: '实现用户认证功能',
        content: '使用JWT实现用户登录和注册功能',
        status: 'in_progress',
        dueDate: new Date('2024-12-31'),
      },
    });
    console.log('✅ 任务创建成功:', task.title);

    // 分配任务给Agent
    await prisma.agentTask.create({
      data: {
        agentId: agent.id,
        taskId: task.id,
      },
    });
    console.log('✅ 任务分配成功');

    // 创建文档
    const documentation = await prisma.documentation.create({
      data: {
        projectId: project.id,
        title: 'API设计文档',
        content: '详细的API接口设计说明',
        type: 'TECHNICAL',
      },
    });
    console.log('✅ 文档创建成功:', documentation.title);

    // 创建需求
    const requirement = await prisma.requirement.create({
      data: {
        projectId: project.id,
        title: '多用户协作需求',
        content: '系统需要支持多用户协作',
        type: 'FUNCTIONAL',
        priority: 'HIGH',
        source: 'CUSTOMER',
      },
    });
    console.log('✅ 需求创建成功');

    // 创建领域知识
    const domainKnowledge = await prisma.domainKnowledge.create({
      data: {
        projectId: project.id,
        domain: '项目管理',
        description: '项目管理相关的领域知识',
        category: 'BUSINESS',
        tags: ['敏捷开发', 'Scrum', '看板'],
      },
    });
    console.log('✅ 领域知识创建成功:', domainKnowledge.domain);

    console.log('🎉 所有示例数据创建完成！');

    // 显示统计信息
    const stats = await Promise.all([
      prisma.project.count(),
      prisma.team.count(),
      prisma.task.count(),
      prisma.sprint.count(),
      prisma.documentation.count(),
    ]);

    console.log('\n📊 数据统计:');
    console.log(`- 项目: ${stats[0]}`);
    console.log(`- 团队: ${stats[1]}`);
    console.log(`- 任务: ${stats[2]}`);
    console.log(`- Sprint: ${stats[3]}`);
    console.log(`- 文档: ${stats[4]}`);
  } catch (error) {
    console.error('❌ 创建示例数据失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedData();
