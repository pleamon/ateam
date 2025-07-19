import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function testDatabaseConnection() {
    try {
        console.log('🔍 测试数据库连接...');

        // 测试连接
        await prisma.$connect();
        console.log('✅ 数据库连接成功');

        // 测试查询
        const projectCount = await prisma.project.count();
        console.log(`📊 项目数量: ${projectCount}`);

        const teamCount = await prisma.team.count();
        console.log(`👥 团队数量: ${teamCount}`);

        const taskCount = await prisma.task.count();
        console.log(`📋 任务数量: ${taskCount}`);

        await prisma.$disconnect();
        console.log('✅ 数据库连接已关闭');

    } catch (error) {
        console.error('❌ 数据库连接失败:', error);
        process.exit(1);
    }
}

testDatabaseConnection(); 