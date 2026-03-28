import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../../../platform/prisma/prisma.service';
import { VerifyPayloadDto } from './verify-payload.dto';
import { EvaluateOnboardingUseCase } from '../evaluate-onboarding.usecase';

@Injectable()
export class VerifyContractUseCase {
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
        onboarding: { select: { id: true, employeeId: true } },
      },
    });

    if (!checklist)
      throw new NotFoundException(`Task instance ${taskInstanceId} not found`);
    if (checklist.taskInstance.targetDataModel !== 'EMPLOYEE_CONTRACT') {
      throw new BadRequestException('Task does not map to EMPLOYEE_CONTRACT');
    }
    if (checklist.status !== 'SUBMITTED') {
      throw new BadRequestException(
        `Cannot verify a checklist item in status "${checklist.status}"`,
      );
    }

    const { employeeId } = checklist.onboarding;

    await this.prisma.$transaction(async (tx) => {
      if (dto.approved) {
        await tx.employeeContract.update({
          where: { employeeId },
          data: { status: 'VERIFIED', hrFeedback: null },
        });
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
        await tx.employeeContract.update({
          where: { employeeId },
          data: { status: 'REJECTED', hrFeedback: dto.hrFeedback },
        });
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
