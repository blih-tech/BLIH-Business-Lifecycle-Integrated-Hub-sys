import {
  Injectable,
  Logger,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request } from 'express';
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
    const start = Date.now();

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
      };
      console.log(
        '[LoggingInterceptor] INCOMING REQUEST',
        JSON.stringify(requestLog, null, 2),
      );
    }

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        this.logger.log(
          `${request.method ?? 'UNKNOWN'} ${request.url ?? 'UNKNOWN'} - ${duration}ms`,
        );
      }),
    );
  }
}
