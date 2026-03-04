import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { CreateProbationKpiPlanDto } from '@repo/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { resolveEmployeeSubjectOrThrow } from '../../employees/employee-subject.utils';
import { mapProbationPlanResponse } from '../probation.mapper';
import {
  validateProbationGoals,
  validateProbationWindow,
} from '../probation.utils';

@Injectable()
export class CreateProbationPlanUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateProbationKpiPlanDto) {
    const employee = await resolveEmployeeSubjectOrThrow(
      this.prisma,
      dto.employeeId,
    );
    const start = new Date(dto.probationStart);
    const end = new Date(dto.probationEnd);
    validateProbationWindow(start, end);
    validateProbationGoals(dto.goals);

    const existing = await this.prisma.probationKpiPlan.findFirst({
      where: {
        employeeId: employee.id,
        status: { in: ['DRAFT', 'ACTIVE'] },
      },
      select: { id: true },
    });
    if (existing) {
      throw new BadRequestException(
        'Employee already has an open probation plan',
      );
    }

    const employment = await this.prisma.userEmployment.findUnique({
      where: { employeeId: employee.id },
      select: {
        managerEmployment: {
          select: { employee: { select: { userId: true } } },
        },
      },
    });
    const supervisorId =
      dto.supervisorId ??
      employment?.managerEmployment?.employee.userId ??
      null;

    const plan = await this.prisma.$transaction(async (tx) => {
      const created = await tx.probationKpiPlan.create({
        data: {
          employeeId: employee.id,
          supervisorId: supervisorId ?? undefined,
          probationStart: start,
          probationEnd: end,
          goals: (dto.goals ?? undefined) as never,
          development: (dto.development ?? undefined) as never,
          status: 'DRAFT',
        },
      });

      const currentEmployment = await tx.userEmployment.findUnique({
        where: { employeeId: employee.id },
        select: { id: true },
      });
      if (!currentEmployment) {
        throw new NotFoundException('Employment record not found for employee');
      }

      await tx.userEmployment.update({
        where: { employeeId: employee.id },
        data: {
          probationEndAt: end,
        },
      });

      return created;
    });

    return mapProbationPlanResponse(plan);
  }
}
