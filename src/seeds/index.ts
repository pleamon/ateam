import { seedAgentTemplates } from './agent-templates.seed.js';
import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

export async function seedAllData() {
  console.log('开始导入种子数据...\n');

  try {
    // 导入 Agent 提示词模板
    await seedAgentTemplates();

    // 这里可以添加其他种子数据的导入
    // await seedOtherData();

    console.log('\n✅ 所有种子数据导入成功！');
  } catch (error) {
    console.error('\n❌ 种子数据导入失败:', error);
    throw error;
  }
}

// 如果直接运行此文件
if (import.meta.url === `file://${process.argv[1]}`) {
  seedAllData()
    .then(() => {
      console.log('种子数据导入完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('错误:', error);
      process.exit(1);
    })
    .finally(() => {
      prisma.$disconnect();
    });
}
