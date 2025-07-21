import { Injectable, UnauthorizedException, BadRequestException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@shared/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './strategies/jwt.strategy';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    console.log('=======================================');
    console.log('AuthService');
    console.log(this.prisma);
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { username, email, password, nickname } = registerDto;

    // 检查邮箱是否已存在
    const existingEmail = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingEmail) {
      throw new BadRequestException('邮箱已被注册');
    }

    // 检查用户名是否已存在
    const existingUsername = await this.prisma.user.findUnique({
      where: { username },
    });
    if (existingUsername) {
      throw new BadRequestException('用户名已被使用');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = await this.prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        name: nickname,
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // 创建会话
    await this.prisma.session.create({
      data: {
        userId: user.id,
        token: await this.generateToken(user),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天后过期
      },
    });

    // 生成 token
    const token = await this.generateToken(user);

    return {
      token,
      user,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { usernameOrEmail, password } = loginDto;

    // 查找用户（支持用户名或邮箱登录）
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
      },
    });

    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 检查用户状态
    if (!user.isActive) {
      throw new UnauthorizedException('用户已被禁用');
    }

    // 创建会话
    const token = await this.generateToken(user);
    await this.prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天后过期
      },
    });

    // 记录登录日志
    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_LOGIN',
        resource: 'AUTH',
        resourceId: user.id,
        details: {
          ip: 'unknown', // 在控制器中获取
          userAgent: 'unknown', // 在控制器中获取
        },
      },
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        nickname: user.name,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  async logout(userId: string, token: string) {
    // 删除会话
    await this.prisma.session.deleteMany({
      where: {
        userId,
        token,
      },
    });

    // 记录登出日志
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'USER_LOGOUT',
        resource: 'AUTH',
        resourceId: userId,
      },
    });
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('用户不存在或已被禁用');
    }

    return user;
  }

  private async generateToken(user: any): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
    return this.jwtService.sign(payload);
  }
}
