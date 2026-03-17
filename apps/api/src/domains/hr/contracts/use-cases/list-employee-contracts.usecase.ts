import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { resolveEmployeeSubjectOrThrow } from '../../employees/employee-subject.utils';

@Injectable()
export class ListEmployeeContractsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(employeeIdOrUserIdOrKeycloakId: string) {
    const employee = await resolveEmployeeSubjectOrThrow(
      this.prisma,
      employeeIdOrUserIdOrKeycloakId,
    );

    const contracts = await this.prisma.contract.findMany({
      where: { employeeId: employee.id },
      orderBy: [{ sequenceNumber: 'desc' }],
    });

    return contracts.map((c) => ({
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
    }));
  }
}
