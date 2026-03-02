import { Injectable, NotFoundException } from '@nestjs/common';
import type { CreateResignationDto } from '@repo/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { validateResignationNotice } from '../notice-validation.utils';
import { mapResignation } from '../offboarding.mapper';

@Injectable()
export class CreateResignationUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateResignationDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
      include: { employment: true },
    });
    if (!user) throw new NotFoundException('User not found');
    const employmentType = user.employment?.employmentType ?? 'FULL_TIME';
    const proposedLastDay = new Date(dto.proposedLastDay);
    const probationEndAt = user.employment?.probationEndAt;
    const isOnProbation = probationEndAt
      ? new Date(probationEndAt) > new Date()
      : false;
    let leaveBalanceDays = 0;
    const balance = await this.prisma.leaveBalance.findFirst({
      where: {
        userId: dto.userId,
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
        userId: dto.userId,
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
