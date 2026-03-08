import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import { OnboardingNotificationService } from '../onboarding/onboarding-notification.service';

function normalizeDateOnly(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function daysBetween(a: Date, b: Date) {
  return Math.round(
    (normalizeDateOnly(a).getTime() - normalizeDateOnly(b).getTime()) /
      (1000 * 60 * 60 * 24),
  );
}

@Injectable()
export class ProbationMilestoneJob {
  private readonly logger = new Logger(ProbationMilestoneJob.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: OnboardingNotificationService,
  ) {}

  @Cron('0 15 8 * * *')
  async run(): Promise<void> {
    const today = normalizeDateOnly(new Date());
    const activePlans = await this.prisma.probationKpiPlan.findMany({
      where: {
        status: 'ACTIVE',
      },
      select: {
        id: true,
        employeeId: true,
        supervisorId: true,
        probationStart: true,
        probationEnd: true,
      },
    });

    let notificationsCount = 0;

    for (const plan of activePlans) {
      const daysFromStart = daysBetween(today, plan.probationStart);
      const daysToEnd = daysBetween(plan.probationEnd, today);

      if (daysFromStart === 30) {
        await this.notifications.notifyUsers({
          userIds: [plan.supervisorId],
          title: '30-day probation milestone reached',
          body: `Probation plan ${plan.id} has reached the 30-day checkpoint.`,
          payload: { probationPlanId: plan.id, employeeId: plan.employeeId },
        });
        notificationsCount += 1;
      }

      if (daysToEnd === 7) {
        await this.notifications.notifyUsers({
          userIds: [plan.supervisorId],
          title: '7-day probation review warning',
          body: `Probation plan ${plan.id} reaches its end date in 7 days.`,
          payload: { probationPlanId: plan.id, employeeId: plan.employeeId },
        });
        notificationsCount += 1;
      }

      if (daysToEnd === -1 || daysToEnd === -14) {
        const finalEvaluation = await this.prisma.probationEvaluation.findFirst(
          {
            where: {
              probationPlanId: plan.id,
              round: 'DAY_60_FINAL',
            },
            select: { id: true },
          },
        );

        if (!finalEvaluation) {
          await this.notifications.notifyUsers({
            userIds: [plan.supervisorId],
            title:
              daysToEnd === -1
                ? 'Probation review overdue'
                : 'Probation review escalation',
            body:
              daysToEnd === -1
                ? `Probation plan ${plan.id} has passed its end date without a final review.`
                : `Probation plan ${plan.id} remains overdue for review after 14 days.`,
            priority: daysToEnd === -14 ? 'high' : 'medium',
            payload: { probationPlanId: plan.id, employeeId: plan.employeeId },
          });
          notificationsCount += 1;
        }
      }
    }

    this.logger.log(
      `Processed ${activePlans.length} active probation plans and emitted ${notificationsCount} milestone notifications`,
    );
  }
}
