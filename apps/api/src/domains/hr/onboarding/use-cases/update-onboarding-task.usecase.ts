import { Injectable, NotFoundException } from '@nestjs/common';
import type { UpdateOnboardingTaskDto } from '@repo/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapOnboardingTaskResponse } from '../onboarding.mapper';

@Injectable()
export class UpdateOnboardingTaskUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    checklistId: string,
    taskId: string,
    dto: UpdateOnboardingTaskDto,
  ) {
    const task = await this.prisma.onboardingTask.findFirst({
      where: { id: taskId, checklistId },
      select: { id: true, checklistId: true, status: true },
    });
    if (!task) throw new NotFoundException('Onboarding task not found');

    const completedAt =
      dto.status === 'COMPLETED'
        ? dto.completedAt
          ? new Date(dto.completedAt)
          : new Date()
        : undefined;
    const wasAlreadyCompleted = task.status === 'COMPLETED';

    const updated = await this.prisma.$transaction(async (tx) => {
      const t = await tx.onboardingTask.update({
        where: { id: taskId },
        data: {
          ...(dto.status !== undefined && { status: dto.status as never }),
          ...(completedAt !== undefined && {
            completedAt,
            completedById: dto.completedById ?? undefined,
          }),
        },
      });

      if (dto.status === 'COMPLETED' && !wasAlreadyCompleted) {
        const checklist = await tx.onboardingChecklist.findUnique({
          where: { id: checklistId },
          select: { completedItems: true, totalItems: true },
        });
        if (checklist) {
          await tx.onboardingChecklist.update({
            where: { id: checklistId },
            data: {
              completedItems: checklist.completedItems + 1,
              status:
                checklist.completedItems + 1 >= checklist.totalItems
                  ? 'COMPLETED'
                  : 'IN_PROGRESS',
            },
          });
        }
      }

      return t;
    });

    return mapOnboardingTaskResponse(updated);
  }
}
