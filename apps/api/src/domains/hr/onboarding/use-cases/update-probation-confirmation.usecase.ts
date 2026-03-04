import { Injectable, NotFoundException } from '@nestjs/common';
import type { UpdateProbationConfirmationDto } from '@repo/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapProbationConfirmationResponse } from '../probation.mapper';

@Injectable()
export class UpdateProbationConfirmationUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, dto: UpdateProbationConfirmationDto) {
    const existing = await this.prisma.probationConfirmation.findUnique({
      where: { id },
    });
    if (!existing)
      throw new NotFoundException('Probation confirmation not found');

    const updated = await this.prisma.probationConfirmation.update({
      where: { id },
      data: {
        hrCheckedAt:
          dto.hrCheckedAt === undefined
            ? undefined
            : dto.hrCheckedAt
              ? new Date(dto.hrCheckedAt)
              : null,
        ceoSignOffAt:
          dto.ceoSignOffAt === undefined
            ? undefined
            : dto.ceoSignOffAt
              ? new Date(dto.ceoSignOffAt)
              : null,
        employeeNotifiedAt:
          dto.employeeNotifiedAt === undefined
            ? undefined
            : dto.employeeNotifiedAt
              ? new Date(dto.employeeNotifiedAt)
              : null,
        archivedInEmployeeFile: dto.archivedInEmployeeFile ?? undefined,
      },
    });

    return mapProbationConfirmationResponse(updated);
  }
}
