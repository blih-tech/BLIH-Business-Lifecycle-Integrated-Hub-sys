import { Injectable } from '@nestjs/common';
import type { CreateDisciplinaryActionDto } from '@repo/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { resolveEmployeeSubjectOrThrow } from '../../employees/employee-subject.utils';
import { requiresTerminationApproval } from '../disciplinary.utils';
import { mapDisciplinaryAction } from '../relations.mapper';

@Injectable()
export class CreateDisciplinaryActionUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateDisciplinaryActionDto) {
    const employee = await resolveEmployeeSubjectOrThrow(
      this.prisma,
      dto.employeeId,
      'Employee not found',
    );
    if (dto.incidentReportId) {
      await this.prisma.incidentReport.findUniqueOrThrow({
        where: { id: dto.incidentReportId },
      });
    }
    if (dto.approvedById) {
      await this.prisma.user.findUniqueOrThrow({
        where: { id: dto.approvedById },
      });
    }
    const effectiveFrom = new Date(dto.effectiveFrom);
    const expiresAt: Date | null = dto.expiresAt
      ? new Date(dto.expiresAt)
      : null;
    const durationDays = dto.durationDays ?? null;
    const status = requiresTerminationApproval(dto.actionType as never)
      ? 'PENDING'
      : 'ACTIVE';
    const action = await this.prisma.disciplinaryAction.create({
      data: {
        employeeId: employee.id,
        incidentType: dto.incidentType as never,
        actionType: dto.actionType as never,
        incidentReportId: dto.incidentReportId ?? null,
        description: dto.description,
        effectiveFrom,
        expiresAt,
        durationDays,
        approvedById: dto.approvedById ?? null,
        status: status as never,
      },
    });
    return mapDisciplinaryAction(action);
  }
}
