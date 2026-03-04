import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import { resolveEmployeeSubjectOrThrow } from '../../../domains/hr/employees/employee-subject.utils';

@Injectable()
export class ListUserCompensationHistoryUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userIdOrKeycloakId: string) {
    const employee = await resolveEmployeeSubjectOrThrow(
      this.prisma,
      userIdOrKeycloakId,
    );

    const entries = await this.prisma.userCompensationHistory.findMany({
      where: { employeeId: employee.id },
      orderBy: { validFrom: 'desc' },
    });

    return entries.map((entry) => ({
      ...entry,
      baseSalary: entry.baseSalary?.toString() ?? null,
      bonusRate: entry.bonusRate?.toString() ?? null,
      validFrom: entry.validFrom.toISOString(),
      validTo: entry.validTo?.toISOString() ?? null,
      createdAt: entry.createdAt.toISOString(),
    }));
  }
}
