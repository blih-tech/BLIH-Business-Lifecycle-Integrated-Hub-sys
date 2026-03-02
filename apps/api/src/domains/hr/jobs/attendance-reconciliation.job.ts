import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import { AttendanceReconciliationService } from '../attendance/attendance-reconciliation.service';
import {
  addUtcDays,
  normalizeDateOnly,
} from '../attendance/attendance-date.util';

@Injectable()
export class AttendanceReconciliationJob {
  private readonly logger = new Logger(AttendanceReconciliationJob.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly reconciliation: AttendanceReconciliationService,
  ) {}

  @Cron('0 15 0 * * *')
  async run(): Promise<void> {
    const today = normalizeDateOnly(new Date());
    const yesterday = addUtcDays(today, -1);
    const users = await this.prisma.user.findMany({
      where: {
        OR: [
          { lifecycle: null },
          { lifecycle: { status: { not: 'TERMINATED' } } },
        ],
      },
      select: { id: true },
    });

    let count = 0;
    for (const user of users) {
      await this.reconciliation.reconcileDateForUser(user.id, yesterday);
      await this.reconciliation.reconcileDateForUser(user.id, today);
      count += 1;
    }

    this.logger.log(
      `Attendance reconciliation completed for ${count} users on ${today.toISOString().slice(0, 10)}`,
    );
  }
}
