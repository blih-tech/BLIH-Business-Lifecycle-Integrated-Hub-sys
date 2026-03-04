import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import { resolveEmployeeSubjectOrThrow } from '../../../domains/hr/employees/employee-subject.utils';

@Injectable()
export class GetUserLifecycleUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userIdOrKeycloakId: string) {
    const employee = await resolveEmployeeSubjectOrThrow(
      this.prisma,
      userIdOrKeycloakId,
    );

    const lifecycle = await this.prisma.userLifecycle.findUnique({
      where: { employeeId: employee.id },
    });
    if (!lifecycle) {
      throw new NotFoundException('Employee lifecycle not found');
    }

    return {
      ...lifecycle,
      onboardedAt: lifecycle.onboardedAt?.toISOString() ?? null,
      suspendedAt: lifecycle.suspendedAt?.toISOString() ?? null,
      terminatedAt: lifecycle.terminatedAt?.toISOString() ?? null,
      createdAt: lifecycle.createdAt.toISOString(),
      updatedAt: lifecycle.updatedAt.toISOString(),
    };
  }
}
