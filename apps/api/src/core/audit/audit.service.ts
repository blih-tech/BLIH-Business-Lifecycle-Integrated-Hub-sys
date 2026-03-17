import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../platform/prisma/prisma-client';
import { PrismaService } from '../../platform/prisma/prisma.service';
import { AuditQueryDto } from './dto/audit-query.dto';
import { AuditRecordDto } from './dto/audit-record.dto';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async record(dto: AuditRecordDto) {
    return this.prisma.auditLog.create({
      data: {
        action: dto.action,
        module: dto.module,
        resource: dto.resource,
        resourceId: dto.resourceId,
        actorUserId: dto.actorUserId,
        actorEmail: dto.actorEmail,
        requestId: dto.requestId,
        correlationId: dto.correlationId,
        ipAddress: dto.ipAddress,
        userAgent: dto.userAgent,
        result: dto.result ?? 'SUCCESS',
        statusCode: dto.statusCode,
        before: dto.before as Prisma.InputJsonValue | undefined,
        after: dto.after as Prisma.InputJsonValue | undefined,
        metadata: dto.metadata as Prisma.InputJsonValue | undefined,
      },
    });
  }

  async query(dto: AuditQueryDto) {
    return this.prisma.auditLog.findMany({
      where: {
        action: dto.action,
        module: dto.module,
        actorUserId: dto.actorUserId,
        result: dto.result,
        statusCode: dto.statusCode,
        createdAt: {
          gte: dto.from ? new Date(dto.from) : undefined,
          lte: dto.to ? new Date(dto.to) : undefined,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async export(dto: AuditQueryDto) {
    const rows = await this.query(dto);

    const csvRows = [
      'id,action,module,resource,result,statusCode,actorUserId,requestId,createdAt',
      ...rows.map((row) =>
        [
          row.id,
          row.action,
          row.module,
          row.resource,
          row.result,
          row.statusCode ?? '',
          row.actorUserId ?? '',
          row.requestId,
          row.createdAt.toISOString(),
        ].join(','),
      ),
    ];

    return {
      format: 'csv',
      content: csvRows.join('\n'),
      total: rows.length,
    };
  }
}
