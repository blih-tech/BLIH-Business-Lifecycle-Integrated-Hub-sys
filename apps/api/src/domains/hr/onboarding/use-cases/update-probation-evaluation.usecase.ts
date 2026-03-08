import { Injectable, NotFoundException } from '@nestjs/common';
import type { UpdateProbationEvaluationDto } from '@repo/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapProbationEvaluationResponse } from '../probation.mapper';

@Injectable()
export class UpdateProbationEvaluationUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, dto: UpdateProbationEvaluationDto) {
    const existing = await this.prisma.probationEvaluation.findUnique({
      where: { id },
    });
    if (!existing)
      throw new NotFoundException('Probation evaluation not found');

    const data: {
      recommendation?: NonNullable<
        UpdateProbationEvaluationDto['finalDecision']
      >;
      employeeComments?: string | null;
      status?: 'APPROVED';
    } = {};

    if (dto.finalDecision) {
      data.recommendation = dto.finalDecision;
    }
    if (dto.employeeAcknowledgedAt !== undefined) {
      data.employeeComments = dto.employeeAcknowledgedAt
        ? `Acknowledged at ${dto.employeeAcknowledgedAt}`
        : null;
    }
    if (dto.employeeStatusUpdatedAt) {
      data.status = 'APPROVED';
    }

    if (Object.keys(data).length === 0) {
      return mapProbationEvaluationResponse(existing);
    }

    const updated = await this.prisma.probationEvaluation.update({
      where: { id },
      data,
    });

    return mapProbationEvaluationResponse(updated);
  }
}
