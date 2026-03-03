import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../platform/prisma/prisma.service';
import { resolveEmployeeSubjectOrThrow } from './employees/employee-subject.utils';

@Injectable()
export class HrUserLifecycleService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserForLeave(employeeIdOrUserIdOrKeycloakId: string) {
    const subject = await resolveEmployeeSubjectOrThrow(
      this.prisma,
      employeeIdOrUserIdOrKeycloakId,
    );
    const employee = await this.prisma.employee.findUnique({
      where: { id: subject.id },
      select: {
        id: true,
        userId: true,
        lifecycle: { select: { status: true } },
        employment: { select: { employmentType: true } },
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }
    if (employee.lifecycle?.status === 'TERMINATED') {
      throw new BadRequestException(
        'Leave requests are blocked for terminated employees',
      );
    }

    return employee;
  }

  async assertAttendanceAllowed(employeeIdOrUserIdOrKeycloakId: string) {
    const subject = await resolveEmployeeSubjectOrThrow(
      this.prisma,
      employeeIdOrUserIdOrKeycloakId,
    );
    const employee = await this.prisma.employee.findUnique({
      where: { id: subject.id },
      select: {
        id: true,
        userId: true,
        lifecycle: { select: { status: true } },
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }
    if (employee.lifecycle?.status === 'TERMINATED') {
      throw new BadRequestException(
        'Attendance cannot be recorded for terminated employees',
      );
    }

    return employee;
  }
}
