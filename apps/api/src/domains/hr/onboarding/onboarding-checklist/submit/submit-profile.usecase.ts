import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../../../platform/prisma/prisma.service';
import { SubmitUserProfileDto } from './execution.dto';
import { EvaluateOnboardingUseCase } from '../evaluate-onboarding.usecase';

@Injectable()
export class SubmitUserProfileUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly evaluateOnboarding: EvaluateOnboardingUseCase,
  ) {}

  async execute(
    taskInstanceId: string,
    dto: SubmitUserProfileDto,
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
    if (checklist.taskInstance.targetDataModel !== 'USER_PROFILE') {
      throw new BadRequestException(
        'Task instance does not map to USER_PROFILE',
      );
    }

    const { employeeId } = checklist.onboarding;

    await this.prisma.$transaction(async (tx) => {
      // Upsert UserProfile — status is PENDING_REVIEW (matches Staging Pattern)
      await tx.userProfile.upsert({
        where: { employeeId },
        update: {
          ...(dto.dateOfBirth && { dateOfBirth: new Date(dto.dateOfBirth) }),
          ...(dto.gender && { gender: dto.gender as any }),
          ...(dto.maritalStatus && { maritalStatus: dto.maritalStatus as any }),
          ...(dto.phone && { additionalPhone: dto.phone }),
          status: 'PENDING_REVIEW',
          hrFeedback: null,
        },
        create: {
          employeeId,
          ...(dto.dateOfBirth && { dateOfBirth: new Date(dto.dateOfBirth) }),
          ...(dto.gender && { gender: dto.gender as any }),
          ...(dto.maritalStatus && { maritalStatus: dto.maritalStatus as any }),
          ...(dto.phone && { additionalPhone: dto.phone }),
          additionalPhoneType: 'MOBILE' as any,
          status: 'PENDING_REVIEW',
        },
      });

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
