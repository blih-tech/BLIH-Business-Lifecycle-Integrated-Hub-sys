import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapEmployeeSkillResponse } from '../training.mapper';

@Injectable()
export class GetEmployeeSkillsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string) {
    const skills = await this.prisma.employeeSkill.findMany({
      where: { userId },
      include: { skill: true },
      orderBy: { createdAt: 'desc' },
    });
    return skills.map(mapEmployeeSkillResponse);
  }
}
