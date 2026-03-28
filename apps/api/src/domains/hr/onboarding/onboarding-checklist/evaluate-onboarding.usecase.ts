import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '../../../../platform/prisma/prisma-client';
import { PrismaService } from '../../../../platform/prisma/prisma.service';

@Injectable()
export class EvaluateOnboardingUseCase {
  private readonly logger = new Logger(EvaluateOnboardingUseCase.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Invoked after any Submission or Verification event.
   * Modifies the parent Onboarding status and handles Phase 6 completion triggers.
   */
  async execute(
    onboardingId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const prisma = tx ?? this.prisma;

    const onboarding = await prisma.onboarding.findUnique({
      where: { id: onboardingId },
      include: { checklists: { select: { status: true, isRequired: true } } },
    });

    if (!onboarding) return;

    const allChecklists = onboarding.checklists;
    const requiredChecklists = allChecklists.filter((c) => c.isRequired);

    const requiredCompleted = requiredChecklists.filter(
      (c) => c.status === 'COMPLETED',
    ).length;

    const anyInProgressOrSubmitted = allChecklists.some((c) =>
      ['SUBMITTED', 'CHANGES_REQUESTED', 'COMPLETED'].includes(c.status),
    );

    let newStatus = onboarding.status;
    let newStartedAt = onboarding.startedAt;
    let newCompletedAt = onboarding.completedAt;
    let employeeStatusUpgrade = false;

    // Start Phase evaluation
    if (anyInProgressOrSubmitted && !newStartedAt) {
      newStartedAt = new Date();
      newStatus = 'IN_PROGRESS';
    }

    // Phase 6 Full Completion rule
    const isFullyCompleted =
      requiredChecklists.length > 0 &&
      requiredCompleted === requiredChecklists.length;

    if (isFullyCompleted) {
      newStatus = 'COMPLETED';
      if (!newCompletedAt) newCompletedAt = new Date();
      employeeStatusUpgrade = true; // Signals transition to ACTIVE
    } else if (newStatus === 'COMPLETED') {
      // Reversion (e.g., HR rejected a previously completed task)
      newStatus = 'IN_PROGRESS';
      newCompletedAt = null;
    }

    // Apply updates if changes detected
    if (
      newStatus !== onboarding.status ||
      newStartedAt?.getTime() !== onboarding.startedAt?.getTime() ||
      newCompletedAt?.getTime() !== onboarding.completedAt?.getTime()
    ) {
      await prisma.onboarding.update({
        where: { id: onboardingId },
        data: {
          status: newStatus as any, // bypassing enum checks for old schemas temporarily if needed
          startedAt: newStartedAt,
          completedAt: newCompletedAt,
        },
      });

      this.logger.log(
        `Onboarding ${onboardingId} transitioned to ${newStatus}`,
      );
    }

    // Trigger Employee Status Upgrade if newly unlocked
    if (employeeStatusUpgrade) {
      const employee = await prisma.employee.findUnique({
        where: { id: onboarding.employeeId },
        select: { employeeStatus: true },
      });

      if (employee && employee.employeeStatus === 'ONBOARDING') {
        await prisma.employee.update({
          where: { id: onboarding.employeeId },
          data: { employeeStatus: 'ACTIVE' },
        });
        this.logger.log(
          `Employee ${onboarding.employeeId} transitioned to ACTIVE state`,
        );
      }
    }
  }
}
