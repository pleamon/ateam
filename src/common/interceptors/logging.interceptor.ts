import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { FastifyRequest } from 'fastify';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<FastifyRequest>();
    const { method, url, ip } = request;
    const userAgent = request.headers['user-agent'] || '';
    const now = Date.now();

    this.logger.log(`${method} ${url} ${ip} ${userAgent}`);

    return next.handle().pipe(
      tap(() => {
        const response = ctx.getResponse();
        const delay = Date.now() - now;
        this.logger.log(`${method} ${url} ${response.statusCode} ${delay}ms`);
      }),
    );
  }
}
