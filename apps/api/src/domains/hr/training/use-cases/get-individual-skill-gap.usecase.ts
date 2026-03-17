import { Injectable, NotFoundException } from '@nestjs/common';
import type { IndividualSkillGapResponseDto } from '@repo/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { readinessScore, computeGap, gapPriority } from '../skill-gap.utils';
import type { SkillLevel } from '@repo/types';
import { resolveEmployeeSubjectOrThrow } from '../../employees/employee-subject.utils';

@Injectable()
export class GetIndividualSkillGapUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    employeeId: string,
    targetPositionId?: string | null,
  ): Promise<IndividualSkillGapResponseDto> {
    const employee = await resolveEmployeeSubjectOrThrow(
      this.prisma,
      employeeId,
    );
    const employeeWithSkills = await this.prisma.employee.findUnique({
      where: { id: employee.id },
      include: { employeeSkills: { include: { skill: true } } },
    });
    if (!employeeWithSkills) throw new NotFoundException('Employee not found');
    let requiredSkills: Array<{
      skillId: string;
      skillName: string;
      requiredLevel: SkillLevel;
    }> = [];
    if (targetPositionId) {
      const jd = await this.prisma.jobDescription.findFirst({
        where: { positionId: targetPositionId },
        orderBy: { version: 'desc' },
      });
      if (jd?.skills && Array.isArray(jd.skills)) {
        const skillIds = (
          jd.skills as Array<{
            skillId?: string;
            name?: string;
            level?: string;
          }>
        )
          .map((s) => s.skillId)
          .filter(Boolean) as string[];
        const skills = await this.prisma.skill.findMany({
          where: { id: { in: skillIds } },
        });
        const byId = Object.fromEntries(skills.map((s) => [s.id, s.name]));
        for (const s of jd.skills as Array<{
          skillId?: string;
          requiredLevel?: SkillLevel;
        }>) {
          if (s.skillId && byId[s.skillId])
            requiredSkills.push({
              skillId: s.skillId,
              skillName: byId[s.skillId],
              requiredLevel: (s.requiredLevel ?? 'INTERMEDIATE') as SkillLevel,
            });
        }
      }
    }
    if (requiredSkills.length === 0) {
      const allSkills = await this.prisma.skill.findMany({
        orderBy: { name: 'asc' },
      });
      requiredSkills = allSkills.slice(0, 20).map((s) => ({
        skillId: s.id,
        skillName: s.name,
        requiredLevel: 'INTERMEDIATE' as SkillLevel,
      }));
    }
    const currentBySkill = Object.fromEntries(
      employeeWithSkills.employeeSkills.map((es) => [
        es.skillId,
        { level: es.level as SkillLevel, name: es.skill.name },
      ]),
    );
    const gaps: IndividualSkillGapResponseDto['gaps'] = [];
    const strengths: IndividualSkillGapResponseDto['strengths'] = [];
    let totalGap = 0;
    let criticalGaps = 0;
    for (const req of requiredSkills) {
      const cur = currentBySkill[req.skillId];
      const gap = computeGap(
        req.requiredLevel,
        cur?.level ? String(cur.level) : null,
      );
      if (gap > 0) {
        totalGap += gap;
        if (gapPriority(gap) === 'HIGH') criticalGaps++;
        gaps.push({
          skillId: req.skillId,
          skillName: req.skillName,
          currentLevel: cur?.level ?? null,
          requiredLevel: req.requiredLevel,
          gap,
          priority: gapPriority(gap),
        });
      } else if (cur && cur.level) {
        strengths.push({
          skillId: req.skillId,
          skillName: req.skillName,
          level: cur.level,
        });
      }
    }
    return {
      employeeId: employeeWithSkills.id,
      targetPositionId: targetPositionId ?? null,
      gaps,
      strengths,
      readinessScore: readinessScore(totalGap),
      totalGaps: gaps.length,
      criticalGaps,
    };
  }
}
