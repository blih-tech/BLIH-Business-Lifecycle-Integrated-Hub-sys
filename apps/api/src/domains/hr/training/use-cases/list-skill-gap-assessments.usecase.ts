import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapSkillGapAssessmentResponse } from '../training.mapper';

@Injectable()
export class ListSkillGapAssessmentsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(departmentId: string) {
    const list = await this.prisma.skillGapAssessment.findMany({
      where: { departmentId },
      orderBy: { assessedAt: 'desc' },
    });
    return list.map(mapSkillGapAssessmentResponse);
  }
}
