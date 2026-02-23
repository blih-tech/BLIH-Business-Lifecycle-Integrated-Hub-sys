import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../platform/prisma/prisma.service';

@Injectable()
export class CleanupAuditJob {
  private readonly logger = new Logger(CleanupAuditJob.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  @Cron('0 0 2 * * *')
  async run(): Promise<void> {
    const retentionDays = Number(
      this.configService.get<string>('AUDIT_RETENTION_DAYS', '2555'),
    );
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - retentionDays);

    const result = await this.prisma.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: threshold,
        },
      },
    });

    this.logger.log(
      `Audit cleanup removed ${result.count} records older than ${retentionDays} days`,
    );
  }
}
