import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../../../platform/prisma/prisma.service';
import { EvaluateOnboardingUseCase } from '../evaluate-onboarding.usecase';

@Injectable()
export class SubmitCustomTaskUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly evaluateOnboarding: EvaluateOnboardingUseCase,
  ) {}

  /**
   * Employee marks a CUSTOM task as done.
   * - If requiresHrVerification = false → COMPLETED immediately.
   * - If requiresHrVerification = true  → SUBMITTED (waits for HR gate).
   */
  async execute(taskInstanceId: string): Promise<{ success: true }> {
    const checklist = await this.prisma.onboardingChecklist.findFirst({
      where: { taskInstanceId },
      include: {
        taskInstance: true,
        onboarding: { select: { id: true, status: true } },
      },
    });

    if (!checklist) {
      throw new NotFoundException(
        `Task instance ${taskInstanceId} not found in checklist`,
      );
    }
    if (checklist.taskInstance.taskType !== 'CUSTOM') {
      throw new BadRequestException(
        'This endpoint is only for CUSTOM task types',
      );
    }
    if (checklist.onboarding.status === 'CANCELLED') {
      throw new BadRequestException('Cannot update a cancelled onboarding');
    }

    await this.prisma.$transaction(async (tx) => {
      const nextStatus = checklist.taskInstance.requiresHrVerification
        ? 'SUBMITTED'
        : 'COMPLETED';

      await tx.onboardingChecklist.update({
        where: { id: checklist.id },
        data: { status: nextStatus },
      });

      await this.evaluateOnboarding.execute(checklist.onboardingId, tx);
    });

    return { success: true };
  }
}
