import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import type { CreateContractDto } from '@repo/types';
import { resolveEmployeeSubjectOrThrow } from '../../employees/employee-subject.utils';

@Injectable()
export class CreateContractUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    employeeIdOrUserIdOrKeycloakId: string,
    dto: CreateContractDto,
  ) {
    const employee = await resolveEmployeeSubjectOrThrow(
      this.prisma,
      employeeIdOrUserIdOrKeycloakId,
    );

    const c = await this.prisma.contract.create({
      data: {
        employeeId: employee.id,
        contractType: dto.contractType,
        sequenceNumber: dto.sequenceNumber,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        trialApplies: dto.trialApplies ?? false,
        trialEndDate: dto.trialEndDate ? new Date(dto.trialEndDate) : undefined,
        trialConfirmed: dto.trialConfirmed ?? false,
        documentUrl: dto.documentUrl ?? undefined,
        status: dto.status ?? 'DRAFT',
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
