import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import { resolveEmployeeSubjectOrThrow } from '../../../domains/hr/employees/employee-subject.utils';

@Injectable()
export class GetUserEmploymentUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userIdOrKeycloakId: string) {
    const employee = await resolveEmployeeSubjectOrThrow(
      this.prisma,
      userIdOrKeycloakId,
    );

    const employment = await this.prisma.userEmployment.findUnique({
      where: { employeeId: employee.id },
      include: {
        position: {
          select: {
            title: true,
            gradeId: true,
            grade: {
              select: {
                code: true,
                name: true,
                level: true,
              },
            },
            departmentId: true,
            department: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
    if (!employment) {
      throw new NotFoundException('Employee employment not found');
    }

    return {
      employeeId: employment.employeeId,
      employeeCode: employment.employeeCode,
      departmentId: employment.position?.departmentId ?? null,
      departmentName: employment.position?.department?.name ?? null,
      positionId: employment.positionId,
      positionTitle: employment.position?.title ?? null,
      jobGradeId: employment.position?.gradeId ?? null,
      jobGradeCode: employment.position?.grade?.code ?? null,
      jobGradeName: employment.position?.grade?.name ?? null,
      jobGradeLevel: employment.position?.grade?.level ?? null,
      employmentType: employment.employmentType,
      managerEmploymentId: employment.managerEmploymentId,
      hiredAt: employment.hiredAt?.toISOString() ?? null,
      probationEndAt: employment.probationEndAt?.toISOString() ?? null,
      confirmedAt: employment.confirmedAt?.toISOString() ?? null,
      createdAt: employment.createdAt.toISOString(),
      updatedAt: employment.updatedAt.toISOString(),
    };
  }
}
