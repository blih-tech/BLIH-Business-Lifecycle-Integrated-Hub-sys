import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { configLoaders, envValidationSchema } from './config';
import { CoreModule } from './core/core.module';
import { DomainsModule } from './domains/domains.module';
import { PlatformModule } from './platform/platform.module';
import { CleanupAuditJob } from './core/jobs/cleanup-audit.job';
import { RotateClientSecretsJob } from './core/jobs/rotate-client-secrets.job';
import { SyncRolesJob } from './core/jobs/sync-roles.job';
import { SyncUsersJob } from './core/jobs/sync-users.job';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';
import { AuditInterceptor } from './shared/interceptors/audit.interceptor';
import { LoggingInterceptor } from './shared/interceptors/logging.interceptor';
import { PreAuditInterceptor } from './shared/interceptors/pre-audit.interceptor';
import { ResponseEnvelopeInterceptor } from './shared/interceptors/response-envelope.interceptor';
import { CorrelationIdMiddleware } from './shared/middlewares/correlation-id.middleware';
import { BrainModule } from './domains/brain/brain.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validationSchema: envValidationSchema,
      load: configLoaders,
      envFilePath: ['.env.local', '.env'],
    }),
    ScheduleModule.forRoot(),
    PlatformModule,
    CoreModule,
    BrainModule,
    DomainsModule,
  ],
  providers: [
    SyncUsersJob,
    SyncRolesJob,
    RotateClientSecretsJob,
    CleanupAuditJob,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: PreAuditInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseEnvelopeInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationIdMiddleware).forRoutes({
      path: '*path',
      method: RequestMethod.ALL,
    });
  }
}
