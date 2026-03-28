import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../../../platform/prisma/prisma.service';
import { EvaluateOnboardingUseCase } from '../evaluate-onboarding.usecase';
import { VerifyPayloadDto } from './verify-payload.dto';

@Injectable()
export class VerifyCustomTaskUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly evaluateOnboarding: EvaluateOnboardingUseCase,
  ) {}

  /**
   * HR verifies a CUSTOM task that was submitted for review.
   * - Approve  → COMPLETED with verifiedAt / verifiedBy.
   * - Reject   → CHANGES_REQUESTED with rejectionReason.
   */
  async execute(
    taskInstanceId: string,
    hrUserId: string,
    dto: VerifyPayloadDto,
  ): Promise<{ success: true }> {
    const checklist = await this.prisma.onboardingChecklist.findFirst({
      where: { taskInstanceId },
      include: {
        taskInstance: true,
        onboarding: { select: { id: true } },
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
    if (checklist.status !== 'SUBMITTED') {
      throw new BadRequestException(
        `Cannot verify a checklist item in status "${checklist.status}"`,
      );
    }

    await this.prisma.$transaction(async (tx) => {
      if (dto.approved) {
        await tx.onboardingChecklist.update({
          where: { id: checklist.id },
          data: {
            status: 'COMPLETED',
            verifiedAt: new Date(),
            verifiedBy: hrUserId,
            rejectionReason: null,
          },
        });
      } else {
        await tx.onboardingChecklist.update({
          where: { id: checklist.id },
          data: {
            status: 'CHANGES_REQUESTED',
            rejectionReason: dto.hrFeedback,
          },
        });
      }

      await this.evaluateOnboarding.execute(checklist.onboardingId, tx);
    });

    return { success: true };
  }
}
