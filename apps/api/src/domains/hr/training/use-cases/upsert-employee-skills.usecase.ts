import { Injectable, NotFoundException } from '@nestjs/common';
import type { UpsertEmployeeSkillsDto } from '@repo/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapEmployeeSkillResponse } from '../training.mapper';

@Injectable()
export class UpsertEmployeeSkillsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string, dto: UpsertEmployeeSkillsDto) {
    await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const results: Awaited<ReturnType<typeof mapEmployeeSkillResponse>>[] = [];
    for (const item of dto.skills) {
      const skill = await this.prisma.skill.findUnique({
        where: { id: item.skillId },
      });
      if (!skill)
        throw new NotFoundException(`Skill not found: ${item.skillId}`);
      const upserted = await this.prisma.employeeSkill.upsert({
        where: {
          userId_skillId: { userId, skillId: item.skillId },
        },
        create: {
          userId,
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
