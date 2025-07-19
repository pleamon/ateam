import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function testAPI() {
    try {
        console.log('🧪 开始API测试...');

        // 测试项目API
        console.log('\n📋 测试项目API:');

        // 创建项目
        const project = await prisma.project.create({
            data: {
                name: '测试项目',
                description: '这是一个测试项目',
            },
        });
        console.log('✅ 项目创建成功:', project.name);

        // 查询项目
        const projects = await prisma.project.findMany();
        console.log(`✅ 查询到 ${projects.length} 个项目`);

        // 测试团队API
        console.log('\n👥 测试团队API:');

        // 创建团队
        const team = await prisma.team.create({
            data: {
                name: '测试团队',
                description: '这是一个测试团队',
            },
        });
        console.log('✅ 团队创建成功:', team.name);

        // 添加团队成员
        const teamMember = await prisma.teamMember.create({
            data: {
                teamId: team.id,
                responsibilities: ['测试', '开发'],
                skills: ['JavaScript', 'TypeScript'],
            },
        });
        console.log('✅ 团队成员创建成功');

        // 测试任务API
        console.log('\n📝 测试任务API:');

        // 创建任务
        const task = await prisma.task.create({
            data: {
                projectId: project.id,
                teamId: team.id,
                title: '测试任务',
                content: '这是一个测试任务',
                status: 'todo',
            },
        });
        console.log('✅ 任务创建成功:', task.title);

        // 分配任务
        const teamMemberTask = await prisma.teamMemberTask.create({
            data: {
                teamMemberId: teamMember.id,
                taskId: task.id,
                status: 'todo',
            },
        });
        console.log('✅ 任务分配成功');

        // 测试Sprint API
        console.log('\n🏃 测试Sprint API:');

        // 创建Sprint
        const sprint = await prisma.sprint.create({
            data: {
                projectId: project.id,
                name: '测试Sprint',
                startDate: new Date(),
                endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14天后
                goal: '完成测试功能',
                status: 'todo',
            },
        });
        console.log('✅ Sprint创建成功:', sprint.name);

        // 测试文档API
        console.log('\n📚 测试文档API:');

        // 创建文档
        const documentation = await prisma.documentation.create({
            data: {
                projectId: project.id,
                teamId: team.id,
                name: '测试文档',
                content: '这是一个测试文档',
                type: 'overview',
            },
        });
        console.log('✅ 文档创建成功:', documentation.name);

        // 测试需求API
        console.log('\n📋 测试需求API:');

        // 创建需求
        const requirement = await prisma.requirement.create({
            data: {
                projectId: project.id,
                content: '这是一个测试需求',
            },
        });
        console.log('✅ 需求创建成功');

        // 测试领域知识API
        console.log('\n🧠 测试领域知识API:');

        // 创建领域知识
        const domainKnowledge = await prisma.domainKnowledge.create({
            data: {
                projectId: project.id,
                domain: '测试领域',
                concepts: ['概念1', '概念2'],
                commonPatterns: ['模式1', '模式2'],
                bestPractices: ['最佳实践1', '最佳实践2'],
                antiPatterns: ['反模式1', '反模式2'],
            },
        });
        console.log('✅ 领域知识创建成功:', domainKnowledge.domain);

        // 显示统计信息
        console.log('\n📊 测试结果统计:');
        const stats = await Promise.all([
            prisma.project.count(),
            prisma.team.count(),
            prisma.task.count(),
            prisma.sprint.count(),
            prisma.documentation.count(),
            prisma.requirement.count(),
            prisma.domainKnowledge.count(),
        ]);

        console.log(`- 项目: ${stats[0]}`);
        console.log(`- 团队: ${stats[1]}`);
        console.log(`- 任务: ${stats[2]}`);
        console.log(`- Sprint: ${stats[3]}`);
        console.log(`- 文档: ${stats[4]}`);
        console.log(`- 需求: ${stats[5]}`);
        console.log(`- 领域知识: ${stats[6]}`);

        console.log('\n🎉 所有API测试通过！');

    } catch (error) {
        console.error('❌ API测试失败:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testAPI(); 