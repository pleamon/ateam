import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@generated/prisma';
import { FastifyReply } from 'fastify';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '数据库操作失败';

    switch (exception.code) {
      case 'P2002': {
        status = HttpStatus.CONFLICT;
        const field = (exception.meta?.target as string[])?.[0];
        message = field ? `${field} 已存在` : '数据已存在';
        break;
      }
      case 'P2025':
        status = HttpStatus.NOT_FOUND;
        message = '记录不存在';
        break;
      case 'P2003':
        status = HttpStatus.BAD_REQUEST;
        message = '外键约束失败';
        break;
      default:
        console.error('Prisma错误:', exception);
    }

    response.status(status).send({
      success: false,
      error: message,
      statusCode: status,
      timestamp: new Date().toISOString(),
    });
  }
}
