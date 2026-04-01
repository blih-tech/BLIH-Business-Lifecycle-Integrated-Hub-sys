import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import type {
  CreateOnboardingDto,
  OnboardingResponseDto,
  OnboardingStatusValue,
  OnboardingChecklistStatusValue,
} from './onboarding.dto';

// ─── Shared helpers ────────────────────────────────────────────────────────────

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

async function getOnboardingTasks(prisma: PrismaService, taskIds: string[]) {
  if (taskIds.length === 0) return [];
  const found = await prisma.onboardingTask.findMany({
    where: { id: { in: taskIds } },
  });
  if (found.length !== taskIds.length) {
    throw new BadRequestException(
      'tasks contains one or more unknown taskId values',
    );
  }
  return found;
}

/** Standard Prisma include for Onboarding queries. */
export const onboardingInclude = {
  checklists: {
    select: {
      id: true,
      taskInstanceId: true,
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
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  checklists: Array<{
    id: string;
    taskInstanceId: string;
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
    completedAt: toIso(onboarding.completedAt),
    createdAt: onboarding.createdAt.toISOString(),
    updatedAt: onboarding.updatedAt.toISOString(),
    checklists: onboarding.checklists.map((item) => ({
      id: item.id,
      taskInstanceId: item.taskInstanceId,
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

    const tasks = dto.tasks ?? [];
    const taskIds = unique(tasks.map((item) => item.taskId));
    if (taskIds.length !== tasks.length) {
      throw new BadRequestException('tasks contains duplicate taskId values');
    }

    const libraryTasks = await getOnboardingTasks(this.prisma, taskIds);

    const onboarding = await this.prisma.$transaction(async (tx) => {
      const created = await tx.onboarding.create({
        data: {
          employeeId: dto.employeeId,
          status: dto.status ?? 'IN_PROGRESS',
          startedAt: dto.startedAt ? new Date(dto.startedAt) : undefined,
          completedAt: dto.completedAt ? new Date(dto.completedAt) : undefined,
        },
      });

      if (tasks.length > 0) {
        for (const item of tasks) {
          const blueprint = libraryTasks.find((t) => t.id === item.taskId)!;

          const instance = await tx.onboardingTaskInstance.create({
            data: {
              title: blueprint.title,
              description: blueprint.description,
              taskType: blueprint.taskType,
              targetDataModel: blueprint.targetDataModel,
              requiresHrVerification: blueprint.requiresHrVerification,
            },
          });

          await tx.onboardingChecklist.create({
            data: {
              onboardingId: created.id,
              taskInstanceId: instance.id,
              status: 'TODO',
              dueDate: item.dueDate ? new Date(item.dueDate) : undefined,
              isRequired: item.isRequired ?? true,
            },
          });
        }
      }

      return tx.onboarding.findUniqueOrThrow({
        where: { id: created.id },
        include: onboardingInclude,
      });
    });

    return mapOnboarding(onboarding);
  }
}
