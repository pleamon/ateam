import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from './modules/auth/decorators/public.decorator';

@ApiTags('系统')
@Controller()
export class AppController {
  @Get('health')
  @Public()
  @ApiOperation({ summary: '健康检查' })
  health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Get()
  @Public()
  @ApiOperation({ summary: '系统信息' })
  info() {
    return {
      message: 'ATeam项目管理API',
      version: '1.0.0',
      docs: '/docs',
    };
  }
}
