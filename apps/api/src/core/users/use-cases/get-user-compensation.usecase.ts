import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import { mapCompensationComponent } from '../compensation-component.mapper';
import { buildCompensationSummary } from '../compensation.utils';
import { resolveEmployeeSubjectOrThrow } from '../../../domains/hr/employees/employee-subject.utils';

@Injectable()
export class GetUserCompensationUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userIdOrKeycloakId: string) {
    const employee = await resolveEmployeeSubjectOrThrow(
      this.prisma,
      userIdOrKeycloakId,
    );

    const [compensation, components] = await Promise.all([
      this.prisma.userCompensation.findUnique({
        where: { employeeId: employee.id },
      }),
      this.prisma.compensationComponent.findMany({
        where: { employeeId: employee.id },
        orderBy: [{ effectiveFrom: 'desc' }, { createdAt: 'desc' }],
      }),
    ]);
    if (!compensation) {
      throw new NotFoundException('Employee compensation not found');
    }

    const mappedComponents = components.map(mapCompensationComponent);

    return {
      ...compensation,
      baseSalary: compensation.baseSalary?.toString() ?? null,
      bonusRate: compensation.bonusRate?.toString() ?? null,
      effectiveFrom: compensation.effectiveFrom?.toISOString() ?? null,
      effectiveTo: compensation.effectiveTo?.toISOString() ?? null,
      components: mappedComponents,
      summary: buildCompensationSummary(
        {
          baseSalary: compensation.baseSalary?.toString() ?? null,
          currency: compensation.currency ?? null,
          payFrequency: compensation.payFrequency,
          bonusEligible: compensation.bonusEligible,
          bonusRate: compensation.bonusRate?.toString() ?? null,
        },
        mappedComponents,
      ),
      createdAt: compensation.createdAt.toISOString(),
      updatedAt: compensation.updatedAt.toISOString(),
    };
  }
}
