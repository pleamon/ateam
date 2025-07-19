import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function testPrismaClient() {
    try {
        console.log('🔍 测试Prisma客户端...');

        // 检查Prisma客户端是否有正确的model
        console.log('📊 检查Prisma客户端模型:');

        // 检查Project模型
        if (prisma.project) {
            console.log('✅ Project模型存在');
        } else {
            console.log('❌ Project模型不存在');
        }

        // 检查Team模型
        if (prisma.team) {
            console.log('✅ Team模型存在');
        } else {
            console.log('❌ Team模型不存在');
        }

        // 检查Task模型
        if (prisma.task) {
            console.log('✅ Task模型存在');
        } else {
            console.log('❌ Task模型不存在');
        }

        // 检查Sprint模型
        if (prisma.sprint) {
            console.log('✅ Sprint模型存在');
        } else {
            console.log('❌ Sprint模型不存在');
        }

        // 检查Documentation模型
        if (prisma.documentation) {
            console.log('✅ Documentation模型存在');
        } else {
            console.log('❌ Documentation模型不存在');
        }

        // 检查Requirement模型
        if (prisma.requirement) {
            console.log('✅ Requirement模型存在');
        } else {
            console.log('❌ Requirement模型不存在');
        }

        // 检查DomainKnowledge模型
        if (prisma.domainKnowledge) {
            console.log('✅ DomainKnowledge模型存在');
        } else {
            console.log('❌ DomainKnowledge模型不存在');
        }

        console.log('\n🎉 Prisma客户端测试完成！');

    } catch (error) {
        console.error('❌ Prisma客户端测试失败:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testPrismaClient(); 