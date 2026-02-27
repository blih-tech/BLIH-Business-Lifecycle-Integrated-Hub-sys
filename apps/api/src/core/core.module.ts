import { Module } from '@nestjs/common';
import { PlatformModule } from '../platform/platform.module';
import { OpenApiDocsModule } from '../shared/docs/openapi/openapi-docs.module';
import { AuditModule } from './audit/audit.module';
import { AuthModule } from './auth/auth.module';
import { DepartmentsModule } from './departments/departments.module';
import { HealthModule } from './health/health.module';
import { NotificationsModule } from './notifications/notifications.module';
import { RbacModule } from './rbac/rbac.module';
import { SystemConfigModule } from './system-config/system-config.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    PlatformModule,
    AuthModule,
    RbacModule,
    DepartmentsModule,
    UsersModule,
    AuditModule,
    NotificationsModule,
    SystemConfigModule,
    HealthModule,
    OpenApiDocsModule,
  ],
  exports: [AuditModule],
})
export class CoreModule {}
