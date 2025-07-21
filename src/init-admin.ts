import { PrismaClient, UserRole } from '@generated/prisma';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function initAdmin() {
  try {
    // 检查是否已有管理员
    const adminCount = await prisma.user.count({
      where: { role: UserRole.ADMIN },
    });

    if (adminCount > 0) {
      console.log('已存在管理员用户');
      return;
    }

    // 创建默认管理员
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.create({
      data: {
        email: 'admin@ateam.com',
        username: 'admin',
        password: hashedPassword,
        name: '系统管理员',
        role: UserRole.ADMIN,
      },
    });

    console.log('成功创建管理员用户:');
    console.log('用户名: admin');
    console.log('密码: admin123');
    console.log('请及时修改默认密码！');
  } catch (error) {
    console.error('创建管理员失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

initAdmin();
