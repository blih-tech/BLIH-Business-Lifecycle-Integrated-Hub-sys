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

    // Find checklist items that are still pending (TODO, SUBMITTED, or CHANGES_REQUESTED)
    // and whose due date has passed
    const overdueChecklists = await this.prisma.onboardingChecklist.findMany({
      where: {
        status: { in: ['TODO', 'SUBMITTED', 'CHANGES_REQUESTED'] },
        dueDate: { lt: now },
      },
      select: { id: true },
    });

    if (overdueChecklists.length === 0) return;

    const ids = overdueChecklists.map((c) => c.id);

    this.logger.warn(
      `Found ${ids.length} overdue onboarding checklist items: ${ids.join(', ')}`,
    );
  }
}
