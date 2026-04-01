import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../../../platform/prisma/prisma-client';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapCompensationComponent } from '../../../../core/users/compensation-component.mapper';
import { buildCompensationSummary } from '../../../../core/users/compensation.utils';
import { resolveEmployeeSubjectOrThrow } from '../employee-subject.utils';

const employeeDetailsInclude = {
  user: {
    select: {
      keycloakId: true,
      username: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      status: true,
    },
  },
  profile: {
    include: {
      nationality: { select: { name: true } },
    },
  },
  employment: {
    include: {
      position: {
        select: {
          title: true,
          departmentId: true,
          department: { select: { name: true } },
        },
      },
    },
  },
  compensation: true,
  compensationComponents: true,
  lifecycle: true,
  _count: {
    select: { employeeDocuments: true },
  },
} satisfies Prisma.EmployeeInclude;

type EmployeeWithDetails = Prisma.EmployeeGetPayload<{
  include: typeof employeeDetailsInclude;
}>;

@Injectable()
export class GetEmployeeFullUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(employeeIdOrUserIdOrKeycloakId: string) {
    const subject = await resolveEmployeeSubjectOrThrow(
      this.prisma,
      employeeIdOrUserIdOrKeycloakId,
    );
    const employee = await this.prisma.employee.findUnique({
      where: { id: subject.id },
      include: employeeDetailsInclude,
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return this.mapEmployee(employee);
  }

  private mapEmployee(employee: EmployeeWithDetails) {
    return {
      id: employee.id,
      userId: employee.userId ?? null,
      keycloakId: employee.user?.keycloakId ?? null,
      username: employee.user?.username ?? null,
      email: employee.user?.email ?? null,
      firstName: employee.user?.firstName ?? null,
      lastName: employee.user?.lastName ?? null,
      phone: employee.user?.phone ?? null,
      status: employee.user?.status ?? null,
      departmentId: employee.employment?.position?.departmentId ?? null,
      departmentName: employee.employment?.position?.department?.name ?? null,
      profile: employee.profile
        ? {
            dateOfBirth: employee.profile.dateOfBirth?.toISOString() ?? null,
            gender: employee.profile.gender,
            nationalityId: employee.profile.nationalityId ?? null,
            nationalityName: employee.profile.nationality?.name ?? null,
            maritalStatus: employee.profile.maritalStatus,
          }
        : null,
      employment: employee.employment
        ? {
            employeeCode: employee.employment.employeeCode ?? null,
            departmentId: employee.employment.position?.departmentId ?? null,
            departmentName:
              employee.employment.position?.department?.name ?? null,
            positionId: employee.employment.positionId ?? null,
            positionTitle: employee.employment.position?.title ?? null,
            employmentType: employee.employment.employmentType,
            managerEmploymentId:
              employee.employment.managerEmploymentId ?? null,
            hiredAt: employee.employment.hiredAt?.toISOString() ?? null,
            probationEndAt:
              employee.employment.probationEndAt?.toISOString() ?? null,
            confirmedAt: employee.employment.confirmedAt?.toISOString() ?? null,
          }
        : null,
      compensation: employee.compensation
        ? {
            baseSalary: employee.compensation.baseSalary?.toString() ?? null,
            currency: employee.compensation.currency ?? null,
            payFrequency: employee.compensation.payFrequency,
            bonusEligible: employee.compensation.bonusEligible,
            bonusRate: employee.compensation.bonusRate?.toString() ?? null,
            effectiveFrom:
              employee.compensation.effectiveFrom?.toISOString() ?? null,
            effectiveTo:
              employee.compensation.effectiveTo?.toISOString() ?? null,
            summary: buildCompensationSummary(
              {
                baseSalary:
                  employee.compensation.baseSalary?.toString() ?? null,
                currency: employee.compensation.currency ?? null,
                payFrequency: employee.compensation.payFrequency,
                bonusEligible: employee.compensation.bonusEligible,
                bonusRate: employee.compensation.bonusRate?.toString() ?? null,
              },
              employee.compensationComponents.map(mapCompensationComponent),
            ),
          }
        : null,
      lifecycle: employee.lifecycle
        ? {
            status: employee.lifecycle.status,
            onboardedAt: employee.lifecycle.onboardedAt?.toISOString() ?? null,
            suspendedAt: employee.lifecycle.suspendedAt?.toISOString() ?? null,
            terminatedAt:
              employee.lifecycle.terminatedAt?.toISOString() ?? null,
            offboardingCompleted: employee.lifecycle.offboardingCompleted,
          }
        : null,
      documentsCount: employee._count.employeeDocuments,
      contractsCount: 0,
      createdAt: employee.createdAt.toISOString(),
      updatedAt: employee.updatedAt.toISOString(),
    };
  }
}
