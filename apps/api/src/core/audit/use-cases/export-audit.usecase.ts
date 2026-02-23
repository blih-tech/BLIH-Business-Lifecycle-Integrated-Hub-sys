import { Injectable } from '@nestjs/common';
import { AuditService } from '../audit.service';
import { AuditQueryDto } from '../dto/audit-query.dto';

@Injectable()
export class ExportAuditUseCase {
  constructor(private readonly auditService: AuditService) {}

  execute(dto: AuditQueryDto) {
    return this.auditService.export(dto);
  }
}
