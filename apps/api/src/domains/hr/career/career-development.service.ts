import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  CreateCareerDevelopmentPlanDto,
  UpdateCareerDevelopmentPlanDto,
  UpdateCareerDevelopmentProgressDto,
} from '@repo/types';
import type { Prisma } from '../../../platform/prisma/prisma-client';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import { resolveEmployeeSubjectOrThrow } from '../employees/employee-subject.utils';
import { mapCareerDevelopmentPlan } from './career.mapper';
import {
  computeCareerPlanProgress,
  deriveCareerPlanStatus,
  normalizeCareerGoals,
  toPrismaJsonValue,
  toPrismaNullableJsonValue,
} from './career.utils';

@Injectable()
export class CareerDevelopmentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCareerDevelopmentPlanDto) {
    const employee = await resolveEmployeeSubjectOrThrow(
      this.prisma,
      dto.employeeId,
    );
    await this.prisma.user.findUniqueOrThrow({
      where: { id: dto.createdById },
      select: { id: true },
    });

    const employment = await this.prisma.userEmployment.findUnique({
      where: { employeeId: employee.id },
      select: { positionId: true },
    });

    if (dto.targetPositionId) {
      await this.prisma.position.findUniqueOrThrow({
        where: { id: dto.targetPositionId },
        select: { id: true },
      });
    }

    const goals = normalizeCareerGoals(dto.goals);
    const progressPercent = computeCareerPlanProgress(goals);
    const status = deriveCareerPlanStatus(goals);

    const data: Prisma.CareerDevelopmentPlanUncheckedCreateInput = {
      employeeId: employee.id,
      currentPositionId: employment?.positionId ?? null,
      targetPositionId: dto.targetPositionId ?? null,
      planYear: dto.planYear,
      title: dto.title.trim(),
      summary: dto.summary ?? null,
      goals: toPrismaJsonValue(goals),
      developmentActions: toPrismaNullableJsonValue(dto.developmentActions),
      successMetrics: toPrismaNullableJsonValue(dto.successMetrics),
      progressPercent,
      lastProgressAt: progressPercent > 0 ? new Date() : null,
      completedAt: status === 'COMPLETED' ? new Date() : null,
      status,
      createdById: dto.createdById,
    };

    const plan = await this.prisma.careerDevelopmentPlan.create({
      data,
    });

    return mapCareerDevelopmentPlan(plan);
  }

  async list(filters: {
    employeeId?: string;
    planYear?: number;
    status?: string;
  }) {
    const employeeId = filters.employeeId
      ? (await resolveEmployeeSubjectOrThrow(this.prisma, filters.employeeId))
          .id
      : undefined;

    const plans = await this.prisma.careerDevelopmentPlan.findMany({
      where: {
        ...(employeeId ? { employeeId } : {}),
        ...(filters.planYear != null ? { planYear: filters.planYear } : {}),
        ...(filters.status ? { status: filters.status as never } : {}),
      },
      orderBy: [{ planYear: 'desc' }, { createdAt: 'desc' }],
    });

    return plans.map(mapCareerDevelopmentPlan);
  }

  async get(id: string) {
    const plan = await this.prisma.careerDevelopmentPlan.findUnique({
      where: { id },
    });
    if (!plan) {
      throw new NotFoundException('Career development plan not found');
    }
    return mapCareerDevelopmentPlan(plan);
  }

  async update(id: string, dto: UpdateCareerDevelopmentPlanDto) {
    const existing = await this.prisma.careerDevelopmentPlan.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Career development plan not found');
    }
    if (existing.status === 'CANCELLED') {
      throw new BadRequestException(
        'Cancelled career development plans cannot be updated',
      );
    }

    if (dto.targetPositionId) {
      await this.prisma.position.findUniqueOrThrow({
        where: { id: dto.targetPositionId },
        select: { id: true },
      });
    }

    const goals =
      dto.goals !== undefined
        ? normalizeCareerGoals(dto.goals)
        : ((Array.isArray(existing.goals) ? existing.goals : []) as never);
    const progressPercent = computeCareerPlanProgress(goals);
    const status = deriveCareerPlanStatus(goals, dto.status);

    const data: Prisma.CareerDevelopmentPlanUncheckedUpdateInput = {
      ...(dto.targetPositionId !== undefined
        ? { targetPositionId: dto.targetPositionId }
        : {}),
      ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
      ...(dto.summary !== undefined ? { summary: dto.summary } : {}),
      ...(dto.goals !== undefined ? { goals: toPrismaJsonValue(goals) } : {}),
      ...(dto.developmentActions !== undefined
        ? {
            developmentActions: toPrismaNullableJsonValue(
              dto.developmentActions,
            ),
          }
        : {}),
      ...(dto.successMetrics !== undefined
        ? {
            successMetrics: toPrismaNullableJsonValue(dto.successMetrics),
          }
        : {}),
      progressPercent,
      lastProgressAt:
        progressPercent > 0 ? new Date() : existing.lastProgressAt,
      completedAt: status === 'COMPLETED' ? new Date() : null,
      status,
    };

    const updated = await this.prisma.careerDevelopmentPlan.update({
      where: { id },
      data,
    });

    return mapCareerDevelopmentPlan(updated);
  }

  async updateProgress(id: string, dto: UpdateCareerDevelopmentProgressDto) {
    const existing = await this.prisma.careerDevelopmentPlan.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Career development plan not found');
    }
    if (existing.status === 'CANCELLED') {
      throw new BadRequestException(
        'Cancelled career development plans cannot accept progress updates',
      );
    }

    const currentGoals = Array.isArray(existing.goals)
      ? (existing.goals as Array<Record<string, unknown>>)
      : [];
    const updatesByGoalId = new Map(
      dto.goals.map((goal) => [goal.goalId, goal] as const),
    );

    const mergedGoals = normalizeCareerGoals(
      currentGoals.map((goal) => {
        const goalId = String(goal.id ?? '');
        const patch = updatesByGoalId.get(goalId);
        if (!patch) {
          return goal as never;
        }

        return {
          ...goal,
          status: patch.status ?? goal.status,
          progress:
            patch.progress !== undefined
              ? patch.progress
              : Number(goal.progress ?? 0),
          notes: patch.notes ?? goal.notes ?? null,
          completedAt: patch.completedAt ?? goal.completedAt ?? null,
        } as never;
      }),
    );

    const progressPercent = computeCareerPlanProgress(mergedGoals);
    const status = deriveCareerPlanStatus(mergedGoals, dto.status);

    const updated = await this.prisma.careerDevelopmentPlan.update({
      where: { id },
      data: {
        goals: toPrismaJsonValue(mergedGoals),
        progressPercent,
        status,
        lastProgressAt: new Date(),
        completedAt: status === 'COMPLETED' ? new Date() : null,
      },
    });

    return mapCareerDevelopmentPlan(updated);
  }
}
