import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { UpdateChecklistStatusDto } from './onboarding-checklist.dto';
import type { OnboardingChecklistResponseDto } from '../onboarding.dto';

const toIso = (value: Date | null | undefined) =>
  value ? value.toISOString() : null;

@Injectable()
export class UpdateChecklistStatusUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    id: string,
    dto: UpdateChecklistStatusDto,
  ): Promise<OnboardingChecklistResponseDto> {
    const checklist = await this.prisma.onboardingChecklist.findUnique({
      where: { id },
      include: { onboarding: { select: { status: true, startedAt: true } } },
    });

    if (!checklist || !checklist.onboarding) {
      throw new NotFoundException(`Checklist item with id "${id}" not found`);
    }

    const onboarding = checklist.onboarding; // Cache to avoid null checks

    if (onboarding.status === 'CANCELLED') {
      throw new BadRequestException(
        'Cannot update checklist for a cancelled onboarding',
      );
    }

    const updatedChecklist = await this.prisma.$transaction(async (tx) => {
      // 1. Update the checklist itself
      const updated = await tx.onboardingChecklist.update({
        where: { id },
        data: {
          ...(dto.status !== undefined && { status: dto.status }),
          ...(dto.dueDate !== undefined && {
            dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
          }),
        },
      });

      // 2. Fetch all checklists for this onboarding
      const allChecklists = await tx.onboardingChecklist.findMany({
        where: { onboardingId: checklist.onboardingId },
        select: { status: true },
      });

      const total = allChecklists.length;
      const completed = allChecklists.filter(
        (c) => c.status === 'COMPLETED',
      ).length;
      const inProgress = allChecklists.filter(
        (c) => c.status === 'IN_PROGRESS',
      ).length;

      // 3. Evaluate parent onboarding status
      let newParentStatus = onboarding.status;
      let newStartedAt: Date | undefined = undefined;
      let newCompletedAt: Date | undefined = undefined;

      if (completed === total && total > 0) {
        newParentStatus = 'COMPLETED';
        newCompletedAt = new Date();
      } else if (completed > 0 || inProgress > 0) {
        newParentStatus = 'IN_PROGRESS';
        if (!onboarding.startedAt) {
          newStartedAt = new Date();
        }
      }

      // If status changed, update the parent onboarding
      if (
        newParentStatus !== onboarding.status ||
        newStartedAt ||
        newCompletedAt
      ) {
        await tx.onboarding.update({
          where: { id: checklist.onboardingId },
          data: {
            status: newParentStatus,
            ...(newStartedAt && { startedAt: newStartedAt }),
            ...(newCompletedAt && { completedAt: newCompletedAt }),
          },
        });
      }

      return updated;
    });

    return {
      id: updatedChecklist.id,
      onboardingTaskId: updatedChecklist.onboardingTaskId,
      onboardingId: updatedChecklist.onboardingId,
      status: updatedChecklist.status as any,
      dueDate: toIso(updatedChecklist.dueDate),
      createdAt: updatedChecklist.createdAt.toISOString(),
      updatedAt: updatedChecklist.updatedAt.toISOString(),
    };
  }
}
