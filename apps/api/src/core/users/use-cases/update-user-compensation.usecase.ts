import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '../../../platform/prisma/prisma-client';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import { mapCompensationComponent } from '../compensation-component.mapper';
import { UpdateUserCompensationDto } from '../dto/update-user-compensation.dto';
import {
  ensureEmployeeForUser,
  resolveEmployeeSubjectOrThrow,
} from '../../../domains/hr/employees/employee-subject.utils';

const FAR_FUTURE = new Date('9999-12-31T23:59:59.999Z');

@Injectable()
export class UpdateUserCompensationUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userIdOrKeycloakId: string, dto: UpdateUserCompensationDto) {
    const employee = await resolveEmployeeSubjectOrThrow(
      this.prisma,
      userIdOrKeycloakId,
      'Employee not found',
    ).catch(async (error) => {
      const user = await this.prisma.user.findFirst({
        where: {
          OR: [{ id: userIdOrKeycloakId }, { keycloakId: userIdOrKeycloakId }],
        },
        select: { id: true },
      });
      if (!user) {
        throw error;
      }
      return ensureEmployeeForUser(this.prisma, user.id);
    });

    const currentCompensation = await this.prisma.userCompensation.findUnique({
      where: { employeeId: employee.id },
      select: {
        baseSalary: true,
        currency: true,
        payFrequency: true,
        bonusEligible: true,
        bonusRate: true,
        effectiveFrom: true,
        effectiveTo: true,
      },
    });

    const effectiveFrom = dto.effectiveFrom
      ? new Date(dto.effectiveFrom)
      : (currentCompensation?.effectiveFrom ?? new Date());
    const effectiveTo = dto.effectiveTo ? new Date(dto.effectiveTo) : null;

    if (effectiveTo && effectiveFrom.getTime() >= effectiveTo.getTime()) {
      throw new BadRequestException('effectiveFrom must be before effectiveTo');
    }

    if (dto.changedById) {
      const changedByUser = await this.prisma.user.findUnique({
        where: { id: dto.changedById },
        select: { id: true },
      });
      if (!changedByUser) {
        throw new BadRequestException(
          'changedById must reference an existing user',
        );
      }
    }

    await this.assertSalaryWithinGradeBand(
      employee.id,
      dto.baseSalary ?? currentCompensation?.baseSalary?.toString() ?? null,
    );

    const compensation = await this.prisma.$transaction(async (tx) => {
      await this.closeOverlappingOpenEntries(tx, employee.id, effectiveFrom);
      await this.assertNoOverlap(tx, employee.id, effectiveFrom, effectiveTo);

      const saved = await tx.userCompensation.upsert({
        where: { employeeId: employee.id },
        update: {
          ...(dto.baseSalary !== undefined
            ? { baseSalary: dto.baseSalary }
            : {}),
          ...(dto.currency !== undefined ? { currency: dto.currency } : {}),
          ...(dto.payFrequency !== undefined
            ? { payFrequency: dto.payFrequency }
            : {}),
          ...(dto.bonusEligible !== undefined
            ? { bonusEligible: dto.bonusEligible }
            : {}),
          ...(dto.bonusRate !== undefined ? { bonusRate: dto.bonusRate } : {}),
          effectiveFrom,
          effectiveTo,
        },
        create: {
          employeeId: employee.id,
          baseSalary: dto.baseSalary,
          currency: dto.currency,
          payFrequency: dto.payFrequency,
          bonusEligible: dto.bonusEligible ?? false,
          bonusRate: dto.bonusRate,
          effectiveFrom,
          effectiveTo,
        },
      });

      await tx.userCompensationHistory.create({
        data: {
          employeeId: employee.id,
          baseSalary: saved.baseSalary,
          currency: saved.currency,
          payFrequency: saved.payFrequency,
          bonusEligible: saved.bonusEligible,
          bonusRate: saved.bonusRate,
          validFrom: effectiveFrom,
          validTo: effectiveTo,
          changeReason: dto.changeReason,
          changedById: dto.changedById,
        },
      });

      return saved;
    });

    const components = await this.prisma.compensationComponent.findMany({
      where: { employeeId: employee.id },
      orderBy: [{ effectiveFrom: 'desc' }, { createdAt: 'desc' }],
    });

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

  private async assertSalaryWithinGradeBand(
    employeeId: string,
    baseSalary: string | null,
  ): Promise<void> {
    if (!baseSalary) {
      return;
    }

    const employment = await this.prisma.userEmployment.findUnique({
      where: { employeeId },
      select: {
        position: {
          select: {
            grade: {
              select: {
                code: true,
                minSalary: true,
                maxSalary: true,
              },
            },
          },
        },
      },
    });

    const grade = employment?.position?.grade;
    if (!grade) {
      return;
    }

    const salary = Number(baseSalary);
    const min = grade.minSalary != null ? Number(grade.minSalary) : null;
    const max = grade.maxSalary != null ? Number(grade.maxSalary) : null;
    if ((min != null && salary < min) || (max != null && salary > max)) {
      throw new BadRequestException(
        `baseSalary must fall within the salary band for grade ${grade.code}`,
      );
    }
  }

  private async closeOverlappingOpenEntries(
    tx: Prisma.TransactionClient,
    employeeId: string,
    effectiveFrom: Date,
  ): Promise<void> {
    await tx.userCompensationHistory.updateMany({
      where: {
        employeeId,
        validFrom: { lt: effectiveFrom },
        OR: [{ validTo: null }, { validTo: { gte: effectiveFrom } }],
      },
      data: {
        validTo: new Date(effectiveFrom.getTime() - 1000),
      },
    });
  }

  private async assertNoOverlap(
    tx: Prisma.TransactionClient,
    employeeId: string,
    validFrom: Date,
    validTo: Date | null,
  ): Promise<void> {
    const overlap = await tx.userCompensationHistory.findFirst({
      where: {
        employeeId,
        validFrom: {
          lte: validTo ?? FAR_FUTURE,
        },
        OR: [{ validTo: null }, { validTo: { gte: validFrom } }],
      },
      select: { id: true },
    });
    if (overlap) {
      throw new BadRequestException(
        'Compensation history range overlaps an existing record',
      );
    }
  }
}
