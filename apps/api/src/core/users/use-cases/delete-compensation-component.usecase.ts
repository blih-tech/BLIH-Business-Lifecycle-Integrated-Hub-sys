import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import { resolveEmployeeSubjectOrThrow } from '../../../domains/hr/employees/employee-subject.utils';

@Injectable()
export class DeleteCompensationComponentUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userIdOrKeycloakId: string, componentId: string) {
    const employee = await resolveEmployeeSubjectOrThrow(
      this.prisma,
      userIdOrKeycloakId,
    );

    const deleted = await this.prisma.compensationComponent.deleteMany({
      where: { id: componentId, employeeId: employee.id },
    });
    if (deleted.count === 0) {
      throw new NotFoundException('Compensation component not found');
    }

    return { success: true };
  }
}
