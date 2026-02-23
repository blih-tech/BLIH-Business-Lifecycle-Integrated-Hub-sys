import { Injectable } from '@nestjs/common';
import { AuditService } from '../audit.service';
import { AuditRecordDto } from '../dto/audit-record.dto';

@Injectable()
export class RecordAuditUseCase {
  constructor(private readonly auditService: AuditService) {}

  execute(dto: AuditRecordDto) {
    return this.auditService.record(dto);
  }
}
