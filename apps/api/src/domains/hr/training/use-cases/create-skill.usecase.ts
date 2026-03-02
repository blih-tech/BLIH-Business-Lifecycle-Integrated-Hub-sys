import { ConflictException, Injectable } from '@nestjs/common';
import type { CreateSkillDto } from '@repo/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapSkillResponse } from '../training.mapper';

@Injectable()
export class CreateSkillUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateSkillDto) {
    const existing = await this.prisma.skill.findUnique({
      where: { name: dto.name.trim() },
    });
    if (existing)
      throw new ConflictException('Skill with this name already exists');
    const skill = await this.prisma.skill.create({
      data: {
        name: dto.name.trim(),
        category: dto.category?.trim() ?? null,
        description: dto.description?.trim() ?? null,
      },
    });
    return mapSkillResponse(skill);
  }
}
