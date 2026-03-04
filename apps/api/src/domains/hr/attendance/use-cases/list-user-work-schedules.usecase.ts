import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapUserWorkScheduleResponse } from '../attendance-config.mapper';
import { resolveEmployeeSubjectOrThrow } from '../../employees/employee-subject.utils';

@Injectable()
export class ListUserWorkSchedulesUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(employeeId: string | undefined) {
    if (!employeeId) {
      throw new BadRequestException('Query parameter employeeId is required');
    }
    const employee = await resolveEmployeeSubjectOrThrow(
      this.prisma,
      employeeId,
    );

    const assignments = await this.prisma.userWorkSchedule.findMany({
      where: { employeeId: employee.id },
      include: {
        schedule: {
          select: { name: true },
        },
      },
      orderBy: [{ effectiveFrom: 'desc' }, { createdAt: 'desc' }],
    });

    return assignments.map(mapUserWorkScheduleResponse);
  }
}
