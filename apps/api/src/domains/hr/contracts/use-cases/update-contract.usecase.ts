import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import type { UpdateContractDto } from '@repo/types';
import { resolveEmployeeSubjectOrThrow } from '../../employees/employee-subject.utils';

@Injectable()
export class UpdateContractUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    employeeIdOrUserIdOrKeycloakId: string,
    contractId: string,
    dto: UpdateContractDto,
  ) {
    const employee = await resolveEmployeeSubjectOrThrow(
      this.prisma,
      employeeIdOrUserIdOrKeycloakId,
    );

    const existing = await this.prisma.contract.findFirst({
      where: { id: contractId, employeeId: employee.id },
    });
    if (!existing) throw new NotFoundException('Contract not found');

    const c = await this.prisma.contract.update({
      where: { id: contractId },
      data: {
        employeeId: employee.id,
        ...(dto.endDate !== undefined && {
          endDate: dto.endDate ? new Date(dto.endDate) : null,
        }),
        ...(dto.trialApplies !== undefined && {
          trialApplies: dto.trialApplies,
        }),
        ...(dto.trialEndDate !== undefined && {
          trialEndDate: dto.trialEndDate ? new Date(dto.trialEndDate) : null,
        }),
        ...(dto.trialConfirmed !== undefined && {
          trialConfirmed: dto.trialConfirmed,
        }),
        ...(dto.documentUrl !== undefined && { documentUrl: dto.documentUrl }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.syncedToFinance !== undefined && {
          syncedToFinance: dto.syncedToFinance,
        }),
        ...(dto.syncedAt !== undefined && {
          syncedAt: dto.syncedAt ? new Date(dto.syncedAt) : null,
        }),
      },
    });

    return {
      id: c.id,
      employeeId: c.employeeId,
      contractType: c.contractType,
      sequenceNumber: c.sequenceNumber,
      startDate: c.startDate.toISOString().slice(0, 10),
      endDate: c.endDate?.toISOString().slice(0, 10) ?? null,
      trialApplies: c.trialApplies,
      trialEndDate: c.trialEndDate?.toISOString().slice(0, 10) ?? null,
      trialConfirmed: c.trialConfirmed,
      documentUrl: c.documentUrl ?? null,
      status: c.status,
      syncedToFinance: c.syncedToFinance,
      syncedAt: c.syncedAt?.toISOString() ?? null,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    };
  }
}
