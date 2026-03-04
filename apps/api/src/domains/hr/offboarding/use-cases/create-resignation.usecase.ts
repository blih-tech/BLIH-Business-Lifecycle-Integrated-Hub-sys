import { Injectable, NotFoundException } from '@nestjs/common';
import type { CreateResignationDto } from '@repo/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { validateResignationNotice } from '../notice-validation.utils';
import { mapResignation } from '../offboarding.mapper';
import { resolveEmployeeSubjectOrThrow } from '../../employees/employee-subject.utils';

@Injectable()
export class CreateResignationUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateResignationDto) {
    const subject = await resolveEmployeeSubjectOrThrow(
      this.prisma,
      dto.employeeId,
    );
    const employee = await this.prisma.employee.findUnique({
      where: { id: subject.id },
      include: { employment: true },
    });
    if (!employee) throw new NotFoundException('Employee not found');
    const employmentType = employee.employment?.employmentType ?? 'FULL_TIME';
    const proposedLastDay = new Date(dto.proposedLastDay);
    const probationEndAt = employee.employment?.probationEndAt;
    const isOnProbation = probationEndAt
      ? new Date(probationEndAt) > new Date()
      : false;
    let leaveBalanceDays = 0;
    const balance = await this.prisma.leaveBalance.findFirst({
      where: {
        employeeId: employee.id,
        leaveType: 'ANNUAL',
        year: new Date().getFullYear(),
      },
    });
    if (balance)
      leaveBalanceDays = Math.max(
        0,
        Number(balance.totalDays) - Number(balance.usedDays),
      );
    const validationResult = validateResignationNotice(
      employmentType as string,
      proposedLastDay,
      isOnProbation,
      { leaveBalanceDays },
    );
    const resignation = await this.prisma.resignation.create({
      data: {
        employeeId: employee.id,
        proposedLastDay,
        reason: dto.reason ?? null,
        reasonNotes: dto.reasonNotes ?? null,
        handoverPlan: (dto.handoverPlan ?? null) as never,
        leaveBalanceOptions: (dto.leaveBalanceOptions ?? null) as never,
        validationResult: validationResult as never,
        status: 'DRAFT',
      },
    });
    return { ...mapResignation(resignation), validationResult };
  }
}
