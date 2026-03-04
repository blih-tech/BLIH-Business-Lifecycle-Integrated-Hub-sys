import { Injectable } from '@nestjs/common';
import type { CreateExitInterviewDto } from '@repo/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapExitInterview } from '../offboarding.mapper';
import { resolveEmployeeSubjectOrThrow } from '../../employees/employee-subject.utils';

@Injectable()
export class CreateExitInterviewUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateExitInterviewDto) {
    const employee = await resolveEmployeeSubjectOrThrow(
      this.prisma,
      dto.employeeId,
    );
    await this.prisma.resignation.findUniqueOrThrow({
      where: { id: dto.resignationId },
    });
    const conductedAt = dto.conductedAt
      ? new Date(dto.conductedAt)
      : new Date();
    const exit = await this.prisma.exitInterview.create({
      data: {
        employeeId: employee.id,
        resignationId: dto.resignationId,
        conductedById: dto.conductedById ?? null,
        conductedAt,
        questions: (dto.questions ?? null) as never,
        answers: (dto.answers ?? null) as never,
        wouldRecommend: dto.wouldRecommend ?? null,
        wouldReturn: dto.wouldReturn ?? null,
        improvementNotes: dto.improvementNotes ?? null,
      },
    });
    return mapExitInterview(exit);
  }
}
