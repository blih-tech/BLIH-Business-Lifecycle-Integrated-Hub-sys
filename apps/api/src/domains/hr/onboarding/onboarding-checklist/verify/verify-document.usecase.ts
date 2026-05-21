import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../../../platform/prisma/prisma.service';
import { VerifyPayloadDto } from './verify-payload.dto';
import { EvaluateOnboardingUseCase } from '../evaluate-onboarding.usecase';

@Injectable()
export class VerifyDocumentUseCase {
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

    if (!checklist) {
      throw new NotFoundException(
        `Task instance ${taskInstanceId} not found in checklist`,
      );
    }
    if (checklist.taskInstance.targetDataModel !== 'EMPLOYEE_DOCUMENT') {
      throw new BadRequestException(
        'Task instance does not map to EMPLOYEE_DOCUMENT',
      );
    }
    if (checklist.status !== 'SUBMITTED') {
      throw new BadRequestException(
        'Task must be in SUBMITTED status before it can be verified',
      );
    }

    const { employeeId } = checklist.onboarding;
    const approved = dto.approved;

    await this.prisma.$transaction(async (tx) => {
      if (approved) {
        // Mark the most recent unverified document as verified
        const unverifiedDoc = await tx.employeeDocument.findFirst({
          where: { employeeId, verified: false },
          orderBy: { createdAt: 'desc' },
          select: { id: true },
        });

        if (unverifiedDoc) {
          await tx.employeeDocument.update({
            where: { id: unverifiedDoc.id },
            data: {
              verified: true,
              verifiedById: hrUserId,
              verifiedAt: new Date(),
            },
          });
        }

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
            rejectionReason: dto.hrFeedback ?? null,
            verifiedBy: hrUserId,
          },
        });
      }

      await this.evaluateOnboarding.execute(checklist.onboardingId, tx);
    });

    return { success: true };
  }
}
