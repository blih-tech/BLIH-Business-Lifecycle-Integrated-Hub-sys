import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import { mapJobGrade } from '../job-grades.mapper';

@Injectable()
export class ListJobGradesUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute() {
    const jobGrades = await this.prisma.jobGrade.findMany({
      orderBy: [{ level: 'asc' }, { code: 'asc' }],
    });
    return jobGrades.map(mapJobGrade);
  }
}
