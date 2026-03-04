import { Injectable, NotFoundException } from '@nestjs/common';
import type { UpsertEmployeeSkillsDto } from '@repo/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapEmployeeSkillResponse } from '../training.mapper';
import { resolveEmployeeSubjectOrThrow } from '../../employees/employee-subject.utils';

@Injectable()
export class UpsertEmployeeSkillsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(employeeId: string, dto: UpsertEmployeeSkillsDto) {
    const employee = await resolveEmployeeSubjectOrThrow(
      this.prisma,
      employeeId,
    );
    const results: Awaited<ReturnType<typeof mapEmployeeSkillResponse>>[] = [];
    for (const item of dto.skills) {
      const skill = await this.prisma.skill.findUnique({
        where: { id: item.skillId },
      });
      if (!skill)
        throw new NotFoundException(`Skill not found: ${item.skillId}`);
      const upserted = await this.prisma.employeeSkill.upsert({
        where: {
          employeeId_skillId: {
            employeeId: employee.id,
            skillId: item.skillId,
          },
        },
        create: {
          employeeId: employee.id,
          skillId: item.skillId,
          level: item.level as never,
          source: (item.source ?? 'SELF') as never,
          attestedAt: new Date(),
        },
        update: {
          level: item.level as never,
          source: (item.source ?? 'SELF') as never,
          attestedAt: new Date(),
        },
        include: { skill: true },
      });
      results.push(mapEmployeeSkillResponse(upserted));
    }
    return results;
  }
}
