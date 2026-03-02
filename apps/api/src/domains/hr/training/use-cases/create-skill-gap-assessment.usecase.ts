import { Injectable } from '@nestjs/common';
import type { CreateSkillGapAssessmentDto } from '@repo/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapSkillGapAssessmentResponse } from '../training.mapper';
import { gapPriority } from '../skill-gap.utils';

@Injectable()
export class CreateSkillGapAssessmentUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateSkillGapAssessmentDto) {
    await this.prisma.department.findUniqueOrThrow({
      where: { id: dto.departmentId },
    });
    await this.prisma.user.findUniqueOrThrow({
      where: { id: dto.assessedById },
    });
    const currentState = dto.currentState ?? [];
    const trainingRecs: Array<{
      skillId: string;
      trainingTitle?: string;
      priority?: string;
    }> = [];
    for (const req of dto.requiredSkills) {
      const cur = currentState.find(
        (c) => c.skillId === req.skillId && c.userId,
      );
      const gap = cur ? cur.gap : 0;
      if (gap > 0)
        trainingRecs.push({ skillId: req.skillId, priority: gapPriority(gap) });
    }
    const criticalCount = trainingRecs.filter(
      (t) => t.priority === 'HIGH',
    ).length;
    const summary =
      dto.criticalGapsSummary ??
      (criticalCount > 0 ? `${criticalCount} critical skill gap(s).` : null);
    const assessment = await this.prisma.skillGapAssessment.create({
      data: {
        departmentId: dto.departmentId,
        assessedById: dto.assessedById,
        assessedAt: new Date(),
        requiredSkills: dto.requiredSkills as never,
        currentState: (dto.currentState ?? []) as never,
        criticalGapsSummary: summary,
        trainingRecommendations: (dto.trainingRecommendations ??
          trainingRecs) as never,
        hireRecommendations: (dto.hireRecommendations ?? null) as never,
      },
    });
    return mapSkillGapAssessmentResponse(assessment);
  }
}
