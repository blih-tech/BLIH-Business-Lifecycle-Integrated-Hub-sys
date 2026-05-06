import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import type {
  OnboardingResponseDto,
  UpdateOnboardingDto,
} from './onboarding.dto';
import { mapOnboarding, onboardingInclude } from './create-onboarding.usecase';

const unique = (values: string[]) => Array.from(new Set(values));

async function assertTaskInstancesExist(
  prisma: PrismaService,
  onboardingId: string,
  taskInstanceIds: string[],
): Promise<void> {
  if (taskInstanceIds.length === 0) return;
  const found = await prisma.onboardingChecklist.findMany({
    where: {
      onboardingId,
      taskInstanceId: { in: taskInstanceIds },
    },
    select: { taskInstanceId: true },
  });
  if (found.length !== taskInstanceIds.length) {
    throw new BadRequestException(
      'tasks contains one or more unknown or invalid taskInstanceId values for this onboarding',
    );
  }
}

@Injectable()
export class UpdateOnboardingUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    id: string,
    dto: UpdateOnboardingDto,
  ): Promise<OnboardingResponseDto> {
    const existing = await this.prisma.onboarding.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException(`Onboarding with id "${id}" not found`);
    }

    if (dto.tasks) {
      const taskIds = dto.tasks.map((item) => item.taskInstanceId);
      const uniqueTaskIds = unique(taskIds);
      if (uniqueTaskIds.length !== taskIds.length) {
        throw new BadRequestException(
          'tasks contains duplicate taskInstanceId values',
        );
      }
      await assertTaskInstancesExist(this.prisma, id, uniqueTaskIds);
    }

    const onboarding = await this.prisma.$transaction(async (tx) => {
      await tx.onboarding.update({
        where: { id },
        data: {
          ...(dto.status !== undefined && { status: dto.status }),
          ...(dto.startedAt !== undefined && {
            startedAt: dto.startedAt ? new Date(dto.startedAt) : null,
          }),
          ...(dto.completedAt !== undefined && {
            completedAt: dto.completedAt ? new Date(dto.completedAt) : null,
          }),
        },
      });

      if (dto.tasks !== undefined) {
        const tasks = dto.tasks;

        if (tasks.length === 0) {
          const toDelete = await tx.onboardingChecklist.findMany({
            where: { onboardingId: id },
            select: { taskInstanceId: true },
          });
          const instanceIds = toDelete.map((c) => c.taskInstanceId);
          await tx.onboardingChecklist.deleteMany({
            where: { onboardingId: id },
          });
          if (instanceIds.length > 0) {
            await tx.onboardingTaskInstance.deleteMany({
              where: { id: { in: instanceIds } },
            });
          }
        } else {
          const keepTaskInstanceIds = tasks.map((item) => item.taskInstanceId);

          const toDelete = await tx.onboardingChecklist.findMany({
            where: {
              onboardingId: id,
              taskInstanceId: { notIn: keepTaskInstanceIds },
            },
            select: { taskInstanceId: true },
          });

          await tx.onboardingChecklist.deleteMany({
            where: {
              onboardingId: id,
              taskInstanceId: { notIn: keepTaskInstanceIds },
            },
          });

          const deleteIds = toDelete.map((c) => c.taskInstanceId);
          if (deleteIds.length > 0) {
            await tx.onboardingTaskInstance.deleteMany({
              where: { id: { in: deleteIds } },
            });
          }

          // We only update existing checklists (upsert is blocked since we shouldn't create new snapshots here natively without a library mapped logic)
          await Promise.all(
            tasks.map((item) =>
              tx.onboardingChecklist.update({
                where: {
                  onboardingId_taskInstanceId: {
                    onboardingId: id,
                    taskInstanceId: item.taskInstanceId,
                  },
                },
                data: {
                  ...(item.status !== undefined && { status: item.status }),
                  ...(item.dueDate !== undefined && {
                    dueDate: item.dueDate ? new Date(item.dueDate) : null,
                  }),
                },
              }),
            ),
          );
        }
      }

      return tx.onboarding.findUnique({
        where: { id },
        include: onboardingInclude,
      });
    });

    if (!onboarding) {
      throw new NotFoundException(`Onboarding with id "${id}" not found`);
    }

    return mapOnboarding(onboarding);
  }
}
