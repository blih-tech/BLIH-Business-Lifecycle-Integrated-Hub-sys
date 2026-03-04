import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import { mapCompensationComponent } from '../compensation-component.mapper';
import { resolveEmployeeSubjectOrThrow } from '../../../domains/hr/employees/employee-subject.utils';

@Injectable()
export class ListCompensationComponentsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userIdOrKeycloakId: string) {
    const employee = await resolveEmployeeSubjectOrThrow(
      this.prisma,
      userIdOrKeycloakId,
    );

    const components = await this.prisma.compensationComponent.findMany({
      where: { employeeId: employee.id },
      orderBy: [{ effectiveFrom: 'desc' }, { createdAt: 'desc' }],
    });
    return components.map(mapCompensationComponent);
  }
}
