import {
  Injectable,
  Logger,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  constructor(private readonly configService: ConfigService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context
      .switchToHttp()
      .getRequest<
        Request & { method?: string; url?: string; body?: unknown }
      >();
    const response = context.switchToHttp().getResponse<Response>();
    const start = Date.now();

    // Browser-sent origin info (no manual frontend setup needed)
    const origin = request.get('origin') ?? request.get('referer') ?? 'unknown';
    const ip = request.ip ?? request.get('x-forwarded-for') ?? 'unknown';
    const userAgent = request.get('user-agent') ?? 'unknown';

    // Only log verbose details if explicitly enabled
    const verboseLogging = this.configService.get<boolean>(
      'VERBOSE_REQUEST_LOGGING',
      false,
    );

    if (verboseLogging) {
      const requestLog: Record<string, unknown> = {
        requestType: 'INCOMING',
        method: request.method ?? 'UNKNOWN',
        url: request.url,
        path: request.path,
        query: request.query,
        headers: request.headers,
        body: request.body,
        origin,
        ip,
        userAgent,
      };
      console.log(
        '[LoggingInterceptor] INCOMING REQUEST',
        JSON.stringify(requestLog, null, 2),
      );
    }

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - start;
          this.logger.log(
            `${request.method ?? 'UNKNOWN'} ${request.url ?? 'UNKNOWN'} ${response.statusCode} - ${duration}ms | from=${origin} | ip=${ip}`,
          );
        },
        error: (error: Error) => {
          const duration = Date.now() - start;
          this.logger.error(
            `${request.method ?? 'UNKNOWN'} ${request.url ?? 'UNKNOWN'} FAILED - ${duration}ms | from=${origin} | ip=${ip} | error=${error.message}`,
          );
        },
      }),
    );
  }
}
