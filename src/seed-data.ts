import { PrismaClient } from '../generated/prisma';

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
      },
    });
    console.log('✅ 团队创建成功:', team.name);

    // 创建团队成员
    const teamMember = await prisma.teamMember.create({
      data: {
        teamId: team.id,
        responsibilities: ['后端开发', 'API设计'],
        skills: ['TypeScript', 'Fastify', 'Prisma'],
      },
    });
    console.log('✅ 团队成员创建成功');

    // 创建任务
    const task = await prisma.task.create({
      data: {
        projectId: project.id,
        teamId: team.id,
        title: '实现用户认证功能',
        content: '使用JWT实现用户登录和注册功能',
        status: 'in_progress',
        dueDate: new Date('2024-12-31'),
      },
    });
    console.log('✅ 任务创建成功:', task.title);

    // 分配任务给团队成员
    await prisma.teamMemberTask.create({
      data: {
        teamMemberId: teamMember.id,
        taskId: task.id,
        status: 'in_progress',
      },
    });
    console.log('✅ 任务分配成功');

    // 创建Sprint
    const sprint = await prisma.sprint.create({
      data: {
        projectId: project.id,
        name: 'Sprint 1 - 基础功能',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-15'),
        goal: '完成用户认证和基础项目管理功能',
        status: 'in_progress',
      },
    });
    console.log('✅ Sprint创建成功:', sprint.name);

    // 创建文档
    const documentation = await prisma.documentation.create({
      data: {
        projectId: project.id,
        teamId: team.id,
        name: 'API设计文档',
        content: '详细的API接口设计说明',
        type: 'technical',
      },
    });
    console.log('✅ 文档创建成功:', documentation.name);

    // 创建需求
    const requirement = await prisma.requirement.create({
      data: {
        projectId: project.id,
        content: '系统需要支持多用户协作',
      },
    });
    console.log('✅ 需求创建成功');

    // 创建领域知识
    const domainKnowledge = await prisma.domainKnowledge.create({
      data: {
        projectId: project.id,
        domain: '项目管理',
        concepts: ['敏捷开发', 'Scrum', '看板'],
        commonPatterns: ['用户故事', '任务分解', '迭代开发'],
        bestPractices: ['持续集成', '代码审查', '测试驱动开发'],
        antiPatterns: ['瀑布式开发', '过度设计', '技术债务'],
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
