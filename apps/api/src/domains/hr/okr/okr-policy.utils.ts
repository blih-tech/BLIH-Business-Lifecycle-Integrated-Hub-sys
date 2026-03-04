import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { CreateOkrDto } from '@repo/types';
import type { PrismaService } from '../../../platform/prisma/prisma.service';
import { resolveEmployeeSubjectOrThrow } from '../employees/employee-subject.utils';

export async function resolveOkrAssignment(
  prisma: PrismaService,
  dto: Pick<CreateOkrDto, 'scope' | 'employeeId' | 'departmentId'>,
): Promise<{ employeeId: string | null; departmentId: string | null }> {
  if (dto.scope === 'COMPANY') {
    if (dto.employeeId != null || dto.departmentId != null) {
      throw new BadRequestException(
        'COMPANY OKRs cannot be assigned to an employee or department',
      );
    }
    return { employeeId: null, departmentId: null };
  }

  if (dto.scope === 'DEPARTMENT') {
    if (!dto.departmentId) {
      throw new BadRequestException('DEPARTMENT OKRs require departmentId');
    }
    const department = await prisma.department.findUnique({
      where: { id: dto.departmentId },
      select: { id: true },
    });
    if (!department) {
      throw new NotFoundException('Department not found');
    }
    return { employeeId: null, departmentId: department.id };
  }

  if (!dto.employeeId) {
    throw new BadRequestException('USER OKRs require employeeId');
  }
  const employee = await resolveEmployeeSubjectOrThrow(prisma, dto.employeeId);
  const employeeWithEmployment = await prisma.employee.findUnique({
    where: { id: employee.id },
    select: {
      id: true,
      employment: {
        select: {
          position: {
            select: {
              departmentId: true,
            },
          },
        },
      },
    },
  });
  if (!employeeWithEmployment) {
    throw new NotFoundException('Employee not found');
  }

  const departmentId =
    dto.departmentId ??
    employeeWithEmployment.employment?.position?.departmentId ??
    null;

  if (dto.departmentId) {
    const department = await prisma.department.findUnique({
      where: { id: dto.departmentId },
      select: { id: true },
    });
    if (!department) {
      throw new NotFoundException('Department not found');
    }
  }

  return {
    employeeId: employeeWithEmployment.id,
    departmentId,
  };
}

export function assertOkrDateRange(startDate: Date, endDate: Date) {
  if (startDate.getTime() > endDate.getTime()) {
    throw new BadRequestException(
      'startDate must be before or equal to endDate',
    );
  }
}

export function assertParentCompatibility(
  child: {
    scope: CreateOkrDto['scope'];
    periodYear: number;
    periodQuarter: number;
    departmentId: string | null;
  },
  parent: {
    scope: string;
    periodYear: number;
    periodQuarter: number;
    departmentId: string | null;
  },
) {
  if (
    parent.periodYear !== child.periodYear ||
    parent.periodQuarter !== child.periodQuarter
  ) {
    throw new BadRequestException('Parent OKR must belong to the same period');
  }

  if (child.scope === 'COMPANY') {
    throw new BadRequestException('COMPANY OKRs cannot have a parent');
  }
  if (child.scope === 'DEPARTMENT' && parent.scope !== 'COMPANY') {
    throw new BadRequestException(
      'DEPARTMENT OKRs can only cascade from COMPANY OKRs',
    );
  }
  if (
    child.scope === 'USER' &&
    parent.scope !== 'DEPARTMENT' &&
    parent.scope !== 'COMPANY'
  ) {
    throw new BadRequestException(
      'USER OKRs can only cascade from DEPARTMENT or COMPANY OKRs',
    );
  }
  if (
    child.scope === 'USER' &&
    parent.scope === 'DEPARTMENT' &&
    child.departmentId &&
    parent.departmentId &&
    child.departmentId !== parent.departmentId
  ) {
    throw new BadRequestException(
      'USER OKR department must match the parent department',
    );
  }
}
