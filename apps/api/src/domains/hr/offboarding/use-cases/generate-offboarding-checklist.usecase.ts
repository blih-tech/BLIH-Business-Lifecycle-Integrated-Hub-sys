import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { OFFBOARDING_TASK_MATRIX, getTaskDueDate } from '../task-matrix.utils';
import { mapOffboardingChecklist } from '../offboarding.mapper';

@Injectable()
export class GenerateOffboardingChecklistUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(resignationId: string) {
    const resignation = await this.prisma.resignation.findUnique({
      where: { id: resignationId },
    });
    if (!resignation) throw new NotFoundException('Resignation not found');
    const lastWorkingDay =
      resignation.actualLastDay ?? resignation.proposedLastDay;
    const existing = await this.prisma.offboardingChecklist.findFirst({
      where: { resignationId },
    });
    if (existing)
      throw new BadRequestException(
        'Checklist already exists for this resignation',
      );
    const lastDay = new Date(lastWorkingDay);
    const checklist = await this.prisma.offboardingChecklist.create({
      data: {
        employeeId: resignation.employeeId,
        resignationId,
        lastWorkingDay: lastDay,
        status: 'PENDING',
        tasks: {
          create: OFFBOARDING_TASK_MATRIX.map((t) => ({
            department: t.department,
            title: t.title,
            dueDate: getTaskDueDate(lastDay, t.deadlineDays),
            status: 'PENDING',
            mandatory: t.mandatory,
          })),
        },
      },
      include: { tasks: true },
    });
    return mapOffboardingChecklist(checklist);
  }
}
