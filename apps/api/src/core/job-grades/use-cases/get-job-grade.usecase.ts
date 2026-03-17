import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import { mapJobGrade } from '../job-grades.mapper';

@Injectable()
export class GetJobGradeUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(jobGradeId: string) {
    const jobGrade = await this.prisma.jobGrade.findUnique({
      where: { id: jobGradeId },
    });
    if (!jobGrade) {
      throw new NotFoundException('Job grade not found');
    }
    return mapJobGrade(jobGrade);
  }
}
