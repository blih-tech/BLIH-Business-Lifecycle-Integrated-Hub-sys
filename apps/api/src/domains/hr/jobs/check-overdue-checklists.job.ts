import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../platform/prisma/prisma.service';

@Injectable()
export class CheckOverdueChecklistsJob {
  private readonly logger = new Logger(CheckOverdueChecklistsJob.name);

  constructor(private readonly prisma: PrismaService) {}

  // Run every hour to check for overdue items
  @Cron(CronExpression.EVERY_HOUR)
  async run(): Promise<void> {
    const now = new Date();

    const overdueChecklists = await this.prisma.onboardingChecklist.findMany({
      where: {
        status: { in: ['NOT_STARTED', 'IN_PROGRESS'] },
        dueDate: { lt: now }, // Due date has passed
      },
      select: { id: true },
    });

    if (overdueChecklists.length === 0) return;

    const ids = overdueChecklists.map((c) => c.id);

    await this.prisma.onboardingChecklist.updateMany({
      where: { id: { in: ids } },
      data: { status: 'OVERDUE' },
    });

    this.logger.log(`Marked ${ids.length} onboarding checklists as OVERDUE`);
  }
}
