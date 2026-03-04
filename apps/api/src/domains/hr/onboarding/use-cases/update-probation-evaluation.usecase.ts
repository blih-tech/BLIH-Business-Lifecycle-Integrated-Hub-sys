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

    const updated = await this.prisma.probationEvaluation.update({
      where: { id },
      data: {
        employeeAcknowledgedAt:
          dto.employeeAcknowledgedAt === undefined
            ? undefined
            : dto.employeeAcknowledgedAt
              ? new Date(dto.employeeAcknowledgedAt)
              : null,
        supervisorApprovedAt:
          dto.supervisorApprovedAt === undefined
            ? undefined
            : dto.supervisorApprovedAt
              ? new Date(dto.supervisorApprovedAt)
              : null,
        hrApprovedAt:
          dto.hrApprovedAt === undefined
            ? undefined
            : dto.hrApprovedAt
              ? new Date(dto.hrApprovedAt)
              : null,
        ceoApprovedAt:
          dto.ceoApprovedAt === undefined
            ? undefined
            : dto.ceoApprovedAt
              ? new Date(dto.ceoApprovedAt)
              : null,
        finalDecision:
          dto.finalDecision === undefined ? undefined : dto.finalDecision,
        extensionDays:
          dto.extensionDays === undefined ? undefined : dto.extensionDays,
        newEndDate:
          dto.newEndDate === undefined
            ? undefined
            : dto.newEndDate
              ? new Date(dto.newEndDate)
              : null,
        employeeStatusUpdatedAt:
          dto.employeeStatusUpdatedAt === undefined
            ? undefined
            : dto.employeeStatusUpdatedAt
              ? new Date(dto.employeeStatusUpdatedAt)
              : null,
      },
    });

    return mapProbationEvaluationResponse(updated);
  }
}
