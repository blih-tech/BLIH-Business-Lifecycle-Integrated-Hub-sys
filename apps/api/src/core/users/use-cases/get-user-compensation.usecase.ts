import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import { mapCompensationComponent } from '../compensation-component.mapper';
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

    return {
      ...compensation,
      baseSalary: compensation.baseSalary?.toString() ?? null,
      bonusRate: compensation.bonusRate?.toString() ?? null,
      effectiveFrom: compensation.effectiveFrom?.toISOString() ?? null,
      effectiveTo: compensation.effectiveTo?.toISOString() ?? null,
      components: components.map(mapCompensationComponent),
      createdAt: compensation.createdAt.toISOString(),
      updatedAt: compensation.updatedAt.toISOString(),
    };
  }
}
