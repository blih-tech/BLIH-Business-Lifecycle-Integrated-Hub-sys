import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../../../platform/prisma/prisma.service';
import { VerifyPayloadDto } from './verify-payload.dto';
import { EvaluateOnboardingUseCase } from '../evaluate-onboarding.usecase';

@Injectable()
export class VerifyPolicyUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly evaluateOnboarding: EvaluateOnboardingUseCase,
  ) {}

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

    if (!checklist)
      throw new NotFoundException(`Task instance ${taskInstanceId} not found`);
    if (
      checklist.taskInstance.targetDataModel !==
      'EMPLOYEE_POLICY_ACKNOWLEDGEMENT'
    ) {
      throw new BadRequestException(
        'Task does not map to EMPLOYEE_POLICY_ACKNOWLEDGEMENT',
      );
    }
    if (checklist.status !== 'SUBMITTED') {
      throw new BadRequestException(
        `Cannot verify a checklist item in status "${checklist.status}"`,
      );
    }

    await this.prisma.$transaction(async (tx) => {
      // Policy acknowledgements are employee-driven; verification just gates the checklist
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
