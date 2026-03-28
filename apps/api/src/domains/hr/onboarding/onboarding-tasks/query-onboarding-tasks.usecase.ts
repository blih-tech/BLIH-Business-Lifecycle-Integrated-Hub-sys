import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../../../platform/prisma/prisma-client';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { buildSuccessEnvelope } from '../../../../shared/dto/response-envelope.dto';
import type { OnboardingTaskListQueryDto } from './onboarding-tasks.dto';
import { mapOnboardingTask } from './create-onboarding-tasks.usecase';

// ─── Shared filter builder ──────────────────────────────────────────────────

function buildWhere(
  query: OnboardingTaskListQueryDto,
): Prisma.OnboardingTaskWhereInput {
  const where: Prisma.OnboardingTaskWhereInput = {};

  if (query.taskType) {
    where.taskType = query.taskType;
  }

  if (query.targetDataModel) {
    where.targetDataModel = query.targetDataModel;
  }

  if (query.requiresHrVerification !== undefined) {
    where.requiresHrVerification = query.requiresHrVerification;
  }

  if (query.search?.trim()) {
    where.OR = [
      { title: { contains: query.search.trim(), mode: 'insensitive' } },
      { description: { contains: query.search.trim(), mode: 'insensitive' } },
    ];
  }

  return where;
}

// ─── Use Cases ────────────────────────────────────────────────────────────────

@Injectable()
export class ListAllOnboardingTasksUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: OnboardingTaskListQueryDto) {
    const tasks = await this.prisma.onboardingTask.findMany({
      where: buildWhere(query),
      orderBy: { createdAt: 'desc' },
    });

    return tasks.map(mapOnboardingTask);
  }
}

@Injectable()
export class ListPaginatedOnboardingTasksUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: OnboardingTaskListQueryDto, requestId: string) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = buildWhere(query);

    const [tasks, total] = await this.prisma.$transaction([
      this.prisma.onboardingTask.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.onboardingTask.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return buildSuccessEnvelope(
      tasks.map(mapOnboardingTask),
      requestId,
      'Onboarding tasks retrieved successfully',
      {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    );
  }
}

@Injectable()
export class GetOnboardingTaskByIdUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string) {
    const task = await this.prisma.onboardingTask.findUnique({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException(`Onboarding task with id "${id}" not found`);
    }

    return mapOnboardingTask(task);
  }
}
