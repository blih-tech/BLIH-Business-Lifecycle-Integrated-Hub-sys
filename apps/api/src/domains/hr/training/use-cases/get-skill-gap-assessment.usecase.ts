import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapSkillGapAssessmentResponse } from '../training.mapper';

@Injectable()
export class GetSkillGapAssessmentUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string) {
    const a = await this.prisma.skillGapAssessment.findUnique({
      where: { id },
    });
    if (!a) throw new NotFoundException('Skill gap assessment not found');
    return mapSkillGapAssessmentResponse(a);
  }
}
