import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../../../platform/prisma/prisma-client';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { buildSuccessEnvelope } from '../../../../shared/dto/response-envelope.dto';
import type { OnboardingTaskListQueryDto } from './onboarding-tasks.dto';
import {
  mapOnboardingTask,
  onboardingTaskInclude,
} from './create-onboarding-tasks.usecase';

// ─── Shared filter builder ──────────────────────────────────────────────────

function buildWhere(
  query: OnboardingTaskListQueryDto,
): Prisma.OnboardingTaskWhereInput {
  const where: Prisma.OnboardingTaskWhereInput = {};

  if (query.department) {
    where.department = query.department;
  }

  if (query.completedById) {
    where.completedById = query.completedById;
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

/** Returns the full (un-paginated) list of onboarding tasks with rich filters. */
@Injectable()
export class ListAllOnboardingTasksUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: OnboardingTaskListQueryDto) {
    const tasks = await this.prisma.onboardingTask.findMany({
      where: buildWhere(query),
      include: onboardingTaskInclude,
      orderBy: { createdAt: 'desc' },
    });

    return tasks.map(mapOnboardingTask);
  }
}

/** Returns a paginated list of onboarding tasks wrapped in a success envelope. */
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
        include: onboardingTaskInclude,
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

/** Returns a single onboarding task by id, or throws 404. */
@Injectable()
export class GetOnboardingTaskByIdUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string) {
    const task = await this.prisma.onboardingTask.findUnique({
      where: { id },
      include: onboardingTaskInclude,
    });

    if (!task) {
      throw new NotFoundException(`Onboarding task with id "${id}" not found`);
    }

    return mapOnboardingTask(task);
  }
}
