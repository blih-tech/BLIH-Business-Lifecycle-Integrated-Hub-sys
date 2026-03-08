import { BadRequestException } from '@nestjs/common';
import type {
  CareerDevelopmentGoalDto,
  CareerDevelopmentPlanStatus,
} from '@repo/types';
import { Prisma } from '../../../platform/prisma/prisma-client';
import { normalizeDateOnly } from '../attendance/attendance-date.util';

export function buildCareerRequestId(
  prefix: string,
  year: number,
  sequence: number,
) {
  return `${prefix}-${year}-${String(sequence).padStart(4, '0')}`;
}

export function parseOptionalDateOnly(value: string | null | undefined) {
  if (value === undefined) {
    return undefined;
  }
  return value ? normalizeDateOnly(value) : null;
}

export function normalizeCareerGoals(
  goals: CareerDevelopmentGoalDto[],
): CareerDevelopmentGoalDto[] {
  if (!Array.isArray(goals) || goals.length === 0) {
    throw new BadRequestException(
      'Career development plans require at least one goal',
    );
  }

  return goals.map((goal, index) => {
    const progress = Math.max(0, Math.min(100, Math.round(goal.progress)));
    const status =
      goal.status === 'COMPLETED' || progress === 100
        ? 'COMPLETED'
        : goal.status;

    return {
      id: goal.id?.trim() || `goal-${index + 1}`,
      title: goal.title.trim(),
      category: goal.category ?? null,
      description: goal.description ?? null,
      targetDate: goal.targetDate ?? null,
      linkedSkillGapId: goal.linkedSkillGapId ?? null,
      linkedTrainingRequestId: goal.linkedTrainingRequestId ?? null,
      status,
      progress: status === 'COMPLETED' ? 100 : progress,
      notes: goal.notes ?? null,
      completedAt:
        status === 'COMPLETED'
          ? (goal.completedAt ?? new Date().toISOString())
          : null,
    };
  });
}

export function computeCareerPlanProgress(goals: CareerDevelopmentGoalDto[]) {
  if (goals.length === 0) {
    return 0;
  }

  return Math.round(
    goals.reduce(
      (sum, goal) => sum + Math.max(0, Math.min(100, goal.progress)),
      0,
    ) / goals.length,
  );
}

export function deriveCareerPlanStatus(
  goals: CareerDevelopmentGoalDto[],
  explicitStatus?: CareerDevelopmentPlanStatus,
): CareerDevelopmentPlanStatus {
  if (explicitStatus === 'CANCELLED') {
    return explicitStatus;
  }

  if (goals.every((goal) => goal.status === 'COMPLETED')) {
    return 'COMPLETED';
  }

  if (
    explicitStatus === 'ACTIVE' ||
    goals.some((goal) => goal.progress > 0 || goal.status === 'IN_PROGRESS')
  ) {
    return 'ACTIVE';
  }

  return explicitStatus ?? 'DRAFT';
}

export function computePercentChange(
  currentBaseSalary: number | null,
  proposedBaseSalary: number,
) {
  if (proposedBaseSalary <= 0) {
    throw new BadRequestException('proposedBaseSalary must be greater than 0');
  }
  if (!currentBaseSalary || currentBaseSalary <= 0) {
    return 100;
  }

  return (
    Math.round(
      ((proposedBaseSalary - currentBaseSalary) / currentBaseSalary) * 10000,
    ) / 100
  );
}

export function assertRequestUpdatable(status: string, entityName: string) {
  if (status !== 'DRAFT') {
    throw new BadRequestException(`Only draft ${entityName} can be updated`);
  }
}

export function assertRequestSubmittable(status: string, entityName: string) {
  if (status !== 'DRAFT') {
    throw new BadRequestException(`Only draft ${entityName} can be submitted`);
  }
}

export function assertRequestPending(status: string, entityName: string) {
  if (status !== 'PENDING') {
    throw new BadRequestException(
      `Only pending ${entityName} can be processed`,
    );
  }
}

export function toPrismaJsonValue(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

export function toPrismaNullableJsonValue(
  value: unknown | null | undefined,
): Prisma.InputJsonValue | typeof Prisma.JsonNull | undefined {
  if (value === undefined) {
    return undefined;
  }

  return value === null ? Prisma.JsonNull : (value as Prisma.InputJsonValue);
}
