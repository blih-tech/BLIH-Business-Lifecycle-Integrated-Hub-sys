import { Injectable } from '@nestjs/common';
import type { CreateOkrDto } from '@repo/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import {
  assertOkrDateRange,
  assertParentCompatibility,
  resolveOkrAssignment,
} from '../okr-policy.utils';
import {
  assertWeightTotal,
  computeKeyResultProgress,
  computeOkrOverall,
} from '../okr-progress.utils';
import { mapOkrResponse } from '../okr.mapper';

@Injectable()
export class CreateOkrUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateOkrDto) {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    assertOkrDateRange(startDate, endDate);

    const assignment = await resolveOkrAssignment(this.prisma, dto);

    if (dto.parentOkrId) {
      const parent = await this.prisma.okr.findUniqueOrThrow({
        where: { id: dto.parentOkrId },
        select: {
          scope: true,
          periodYear: true,
          periodQuarter: true,
          departmentId: true,
        },
      });
      assertParentCompatibility(
        {
          scope: dto.scope,
          periodYear: dto.periodYear,
          periodQuarter: dto.periodQuarter,
          departmentId: assignment.departmentId,
        },
        parent,
      );
    }

    const keyResults = (dto.keyResults ?? []).map((keyResult, index) => {
      const progress = computeKeyResultProgress(
        keyResult.type,
        keyResult.targetValue,
        keyResult.currentValue ?? null,
      );
      return {
        title: keyResult.title,
        type: keyResult.type,
        targetValue: keyResult.targetValue,
        currentValue: keyResult.currentValue ?? null,
        progress: progress.progress,
        status: progress.status,
        weight: keyResult.weight ?? 0,
        sortOrder: keyResult.sortOrder ?? index,
      };
    });

    if (keyResults.length > 0) {
      assertWeightTotal(keyResults);
    }

    const overall = computeOkrOverall(
      keyResults.map((keyResult) => ({
        progress: keyResult.progress,
        status: keyResult.status,
        weight: keyResult.weight,
      })),
    );

    const okr = await this.prisma.okr.create({
      data: {
        employeeId: assignment.employeeId,
        scope: dto.scope,
        departmentId: assignment.departmentId,
        parentOkrId: dto.parentOkrId ?? null,
        periodYear: dto.periodYear,
        periodQuarter: dto.periodQuarter,
        title: dto.title,
        description: dto.description ?? null,
        startDate,
        endDate,
        overallProgress: overall.overallProgress,
        overallStatus: overall.overallStatus,
        keyResults: { create: keyResults },
      },
      include: {
        department: { select: { name: true } },
        keyResults: { orderBy: { sortOrder: 'asc' } },
      },
    });
    return mapOkrResponse(okr);
  }
}
