import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import { OnboardingNotificationService } from '../onboarding/onboarding-notification.service';

@Injectable()
export class OnboardingOverdueJob {
  private readonly logger = new Logger(OnboardingOverdueJob.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: OnboardingNotificationService,
  ) {}

  @Cron('0 0 8 * * *')
  async run(): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdueTasks = await this.prisma.onboardingTask.findMany({
      where: {
        dueDate: { lt: today },
        status: { in: ['PENDING', 'IN_PROGRESS'] },
      },
      include: {
        checklist: {
          select: {
            id: true,
            overseerId: true,
          },
        },
      },
    });

    let notified = 0;
    for (const task of overdueTasks) {
      await this.prisma.onboardingTask.update({
        where: { id: task.id },
        data: { status: 'OVERDUE' },
      });

      await this.prisma.onboardingChecklist.update({
        where: { id: task.checklistId },
        data: { status: 'OVERDUE' },
      });

      await this.notifications.notifyUsers({
        userIds: [task.assignedToId, task.checklist.overseerId],
        title: `Onboarding task overdue: ${task.title}`,
        body: `Onboarding task "${task.title}" is overdue and requires attention.`,
        payload: {
          checklistId: task.checklistId,
          taskId: task.id,
        },
      });
      notified += 1;
    }

    this.logger.log(
      `Processed ${overdueTasks.length} overdue onboarding tasks and notified ${notified} parties`,
    );
  }
}
