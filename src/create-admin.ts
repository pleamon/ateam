import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('🔐 开始创建管理员账户...');

    // 检查是否已存在admin账户
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@example.com' },
    });

    if (existingAdmin) {
      console.log('⚠️  管理员账户已存在');
      return;
    }

    // 创建admin账户
    const hashedPassword = await bcrypt.hash('admin123456', 10);
    const admin = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        username: 'admin',
        password: hashedPassword,
        name: '系统管理员',
        role: 'ADMIN',
        isActive: true,
      },
    });

    console.log('✅ 管理员账户创建成功！');
    console.log('📧 邮箱: admin@example.com');
    console.log('🔑 密码: admin123456');
    console.log('👤 用户名: admin');
    console.log('🆔 用户ID:', admin.id);
    console.log('\n⚠️  请及时修改默认密码！');
  } catch (error) {
    console.error('❌ 创建管理员账户失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 执行创建
createAdmin();
