import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import type {
  CreateOnboardingDto,
  OnboardingResponseDto,
  OnboardingStatusValue,
  OnboardingChecklistStatusValue,
} from './onboarding.dto';

// ─── Shared helpers ────────────────────────────────────────────────────────────

const toDateOnly = (value: Date | null | undefined) =>
  value ? value.toISOString().slice(0, 10) : null;

const toIso = (value: Date | null | undefined) =>
  value ? value.toISOString() : null;

const unique = (values: string[]) => Array.from(new Set(values));

async function assertEmployeeExists(
  prisma: PrismaService,
  employeeId: string,
): Promise<void> {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { id: true },
  });
  if (!employee) {
    throw new BadRequestException(
      'employeeId does not reference an existing employee',
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

/** Standard Prisma include for Onboarding queries. */
export const onboardingInclude = {
  checklists: {
    select: {
      id: true,
      onboardingTaskId: true,
      onboardingId: true,
      status: true,
      dueDate: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: 'asc' },
  },
} as const;

/** Map a Prisma Onboarding record to the response shape. */
export function mapOnboarding(onboarding: {
  id: string;
  employeeId: string;
  status: string;
  startedAt: Date | null;
  joinDate: Date;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  checklists: Array<{
    id: string;
    onboardingTaskId: string;
    onboardingId: string;
    status: string;
    dueDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }>;
}) {
  return {
    id: onboarding.id,
    employeeId: onboarding.employeeId,
    status: onboarding.status as OnboardingStatusValue,
    startedAt: toIso(onboarding.startedAt),
    joinDate: toDateOnly(onboarding.joinDate) ?? '',
    completedAt: toIso(onboarding.completedAt),
    createdAt: onboarding.createdAt.toISOString(),
    updatedAt: onboarding.updatedAt.toISOString(),
    checklists: onboarding.checklists.map((item) => ({
      id: item.id,
      onboardingTaskId: item.onboardingTaskId,
      onboardingId: item.onboardingId,
      status: item.status as OnboardingChecklistStatusValue,
      dueDate: toIso(item.dueDate),
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    })),
  };
}

// ─── Use Case ─────────────────────────────────────────────────────────────────

@Injectable()
export class CreateOnboardingUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateOnboardingDto): Promise<OnboardingResponseDto> {
    await assertEmployeeExists(this.prisma, dto.employeeId);

    const checklists = dto.checklists ?? [];
    const taskIds = unique(checklists.map((item) => item.onboardingTaskId));
    if (taskIds.length !== checklists.length) {
      throw new BadRequestException(
        'checklists contains duplicate onboardingTaskId values',
      );
    }

    await assertOnboardingTasksExist(this.prisma, taskIds);

    const onboarding = await this.prisma.onboarding.create({
      data: {
        employeeId: dto.employeeId,
        joinDate: new Date(dto.joinDate),
        status: dto.status ?? undefined,
        startedAt: dto.startedAt ? new Date(dto.startedAt) : undefined,
        completedAt: dto.completedAt ? new Date(dto.completedAt) : undefined,
        ...(checklists.length > 0 && {
          checklists: {
            create: checklists.map((item) => ({
              onboardingTaskId: item.onboardingTaskId,
              dueDate: item.dueDate ? new Date(item.dueDate) : undefined,
            })),
          },
        }),
      },
      include: onboardingInclude,
    });

    return mapOnboarding(onboarding);
  }
}
