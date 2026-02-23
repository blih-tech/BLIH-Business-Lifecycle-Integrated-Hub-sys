import { Module } from '@nestjs/common';
import { PrismaModule } from '../../platform/prisma/prisma.module';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { AuditStateService } from './audit-state.service';
import { ExportAuditUseCase } from './use-cases/export-audit.usecase';
import { QueryAuditUseCase } from './use-cases/query-audit.usecase';
import { RecordAuditUseCase } from './use-cases/record-audit.usecase';

@Module({
  imports: [PrismaModule],
  controllers: [AuditController],
  providers: [
    AuditService,
    AuditStateService,
    RecordAuditUseCase,
    QueryAuditUseCase,
    ExportAuditUseCase,
  ],
  exports: [AuditService, AuditStateService],
})
export class AuditModule {}
