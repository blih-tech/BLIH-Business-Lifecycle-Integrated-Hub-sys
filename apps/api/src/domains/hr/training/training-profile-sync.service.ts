import { Injectable, NotFoundException } from '@nestjs/common';
import type { SkillsAcquiredItem } from '@repo/types';
import { PrismaService } from '../../../platform/prisma/prisma.service';

const LEVEL_ORDER = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'] as const;

function normalizeLevel(level: string | null | undefined) {
  if (!level) {
    return null;
  }
  return LEVEL_ORDER.includes(level as (typeof LEVEL_ORDER)[number])
    ? (level as (typeof LEVEL_ORDER)[number])
    : null;
}

function maxLevel(current: string | null | undefined, incoming: string | null) {
  const currentIndex = current ? LEVEL_ORDER.indexOf(current as never) : -1;
  const incomingIndex = incoming ? LEVEL_ORDER.indexOf(incoming as never) : -1;
  return incomingIndex > currentIndex ? incoming : (current ?? null);
}

@Injectable()
export class TrainingProfileSyncService {
  constructor(private readonly prisma: PrismaService) {}

  async syncCompletionSkills(input: {
    completionId: string;
    employeeId: string;
    skillsAcquired: SkillsAcquiredItem[] | null;
    attestedAt?: Date | null;
  }) {
    const items = input.skillsAcquired ?? [];
    if (items.length === 0) {
      await this.prisma.trainingCompletion.update({
        where: { id: input.completionId },
        data: { syncedToProfile: false },
      });
      return;
    }

    for (const item of items) {
      const skill = await this.prisma.skill.findUnique({
        where: { id: item.skillId },
        select: { id: true },
      });
      if (!skill) {
        throw new NotFoundException(`Skill not found: ${item.skillId}`);
      }

      const existing = await this.prisma.employeeSkill.findUnique({
        where: {
          employeeId_skillId: {
            employeeId: input.employeeId,
            skillId: item.skillId,
          },
        },
      });

      const nextLevel = maxLevel(
        existing?.level ?? null,
        normalizeLevel(item.levelGain),
      );

      await this.prisma.employeeSkill.upsert({
        where: {
          employeeId_skillId: {
            employeeId: input.employeeId,
            skillId: item.skillId,
          },
        },
        create: {
          employeeId: input.employeeId,
          skillId: item.skillId,
          level: (nextLevel ?? 'BEGINNER') as never,
          source: 'TRAINING',
          attestedAt: input.attestedAt ?? new Date(),
        },
        update: {
          level: (nextLevel ?? existing?.level ?? 'BEGINNER') as never,
          source: 'TRAINING',
          attestedAt: input.attestedAt ?? existing?.attestedAt ?? new Date(),
        },
      });
    }

    await this.prisma.trainingCompletion.update({
      where: { id: input.completionId },
      data: { syncedToProfile: true },
    });
  }
}
