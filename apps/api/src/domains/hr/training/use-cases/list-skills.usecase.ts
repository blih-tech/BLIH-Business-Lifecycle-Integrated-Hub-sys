import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapSkillResponse } from '../training.mapper';

@Injectable()
export class ListSkillsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(filters: { category?: string }) {
    const where = filters.category ? { category: filters.category } : {};
    const skills = await this.prisma.skill.findMany({
      where,
      orderBy: { name: 'asc' },
    });
    return skills.map(mapSkillResponse);
  }
}
