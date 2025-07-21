import {
  Controller,
  Post,
  Body as RequestBody,
  Get,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto, UserResponseDto } from './dto/auth-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import { CurrentUser, CurrentUserData } from './decorators/current-user.decorator';

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {
    console.log('=======================================');
    console.log('AuthController');
    console.log(this.authService);
  }

  @Post('register')
  @Public()
  @ApiOperation({ summary: '用户注册' })
  @ApiResponse({ status: 201, description: '注册成功', type: AuthResponseDto })
  @ApiResponse({ status: 400, description: '参数错误' })
  async register(@RequestBody() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '用户登录' })
  @ApiResponse({ status: 200, description: '登录成功', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: '认证失败' })
  async login(@RequestBody() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: '退出登录' })
  @ApiResponse({ status: 200, description: '退出成功' })
  async logout(
    @CurrentUser() user: CurrentUserData,
    @Req() req: FastifyRequest,
  ): Promise<{ message: string }> {
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    await this.authService.logout(user.id, token);
    return { message: '退出成功' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前用户信息' })
  @ApiResponse({ status: 200, description: '获取成功', type: UserResponseDto })
  async getProfile(@CurrentUser() user: CurrentUserData): Promise<UserResponseDto> {
    const userInfo = await this.authService.validateUser(user.id);
    return userInfo as unknown as UserResponseDto;
  }
}
