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

async function assertUsersExist(
  prisma: PrismaService,
  userIds: string[],
  field: string,
): Promise<void> {
  if (userIds.length === 0) return;
  const found = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true },
  });
  if (found.length !== userIds.length) {
    throw new BadRequestException(
      `${field} contains one or more unknown user ids`,
    );
  }
}

async function assertOnboardingTasksExist(
  prisma: PrismaService,
  taskIds: string[],
): Promise<void> {
  if (taskIds.length === 0) return;
  const found = await prisma.onboardingTask.findMany({
    where: { id: { in: taskIds } },
    select: { id: true },
  });
  if (found.length !== taskIds.length) {
    throw new BadRequestException(
      'checklists contains one or more unknown onboardingTaskId values',
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

    if (dto.checklists) {
      const taskIds = dto.checklists.map((item) => item.onboardingTaskId);
      const uniqueTaskIds = unique(taskIds);
      if (uniqueTaskIds.length !== taskIds.length) {
        throw new BadRequestException(
          'checklists contains duplicate onboardingTaskId values',
        );
      }

      await assertOnboardingTasksExist(this.prisma, uniqueTaskIds);

      const overseerIds = unique(
        dto.checklists
          .map((item) => item.overseerId)
          .filter((id): id is string => Boolean(id)),
      );
      await assertUsersExist(this.prisma, overseerIds, 'checklists.overseerId');
    }

    const onboarding = await this.prisma.$transaction(async (tx) => {
      await tx.onboarding.update({
        where: { id },
        data: {
          ...(dto.status !== undefined && { status: dto.status }),
          ...(dto.joinDate !== undefined && {
            joinDate: new Date(dto.joinDate),
          }),
          ...(dto.startedAt !== undefined && {
            startedAt: dto.startedAt ? new Date(dto.startedAt) : null,
          }),
          ...(dto.completedAt !== undefined && {
            completedAt: dto.completedAt ? new Date(dto.completedAt) : null,
          }),
        },
      });

      if (dto.checklists !== undefined) {
        const checklists = dto.checklists;

        if (checklists.length === 0) {
          await tx.onboardingChecklist.deleteMany({
            where: { onboardingId: id },
          });
        } else {
          const taskIds = checklists.map((item) => item.onboardingTaskId);

          await tx.onboardingChecklist.deleteMany({
            where: {
              onboardingId: id,
              onboardingTaskId: { notIn: taskIds },
            },
          });

          await Promise.all(
            checklists.map((item) =>
              tx.onboardingChecklist.upsert({
                where: {
                  onboardingId_onboardingTaskId: {
                    onboardingId: id,
                    onboardingTaskId: item.onboardingTaskId,
                  },
                },
                update: {
                  ...(item.overseerId !== undefined && {
                    overseerId: item.overseerId,
                  }),
                  ...(item.ceoSignOffRequired !== undefined && {
                    ceoSignOffRequired: item.ceoSignOffRequired,
                  }),
                  ...(item.status !== undefined && { status: item.status }),
                  ...(item.teamLeadVerifiedAt !== undefined && {
                    teamLeadVerifiedAt: item.teamLeadVerifiedAt
                      ? new Date(item.teamLeadVerifiedAt)
                      : null,
                  }),
                  ...(item.ceoSignOffAt !== undefined && {
                    ceoSignOffAt: item.ceoSignOffAt
                      ? new Date(item.ceoSignOffAt)
                      : null,
                  }),
                },
                create: {
                  onboardingId: id,
                  onboardingTaskId: item.onboardingTaskId,
                  overseerId: item.overseerId ?? null,
                  ceoSignOffRequired: item.ceoSignOffRequired ?? false,
                  status: item.status ?? undefined,
                  teamLeadVerifiedAt: item.teamLeadVerifiedAt
                    ? new Date(item.teamLeadVerifiedAt)
                    : undefined,
                  ceoSignOffAt: item.ceoSignOffAt
                    ? new Date(item.ceoSignOffAt)
                    : undefined,
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
