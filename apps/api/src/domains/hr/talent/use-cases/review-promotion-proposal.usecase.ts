import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { ReviewPromotionProposalDto } from '@repo/types';
import { Prisma } from '../../../../platform/prisma/prisma-client';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapPromotionProposal } from '../talent.mapper';

@Injectable()
export class ReviewPromotionProposalUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, dto: ReviewPromotionProposalDto) {
    const reviewer = await this.prisma.user.findUnique({
      where: { id: dto.approvedById },
      select: { id: true },
    });
    if (!reviewer) {
      throw new NotFoundException('Reviewing user not found');
    }

    const proposal = await this.prisma.promotionProposal.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            employment: {
              select: {
                id: true,
                employeeCode: true,
                employmentType: true,
                managerEmploymentId: true,
                hiredAt: true,
                positionId: true,
              },
            },
          },
        },
      },
    });
    if (!proposal) {
      throw new NotFoundException('Promotion proposal not found');
    }
    if (proposal.status !== 'PENDING') {
      throw new BadRequestException(
        'Only pending promotion proposals can be reviewed',
      );
    }

    const reviewedProposal = await this.prisma.$transaction(async (tx) => {
      const updatedProposal = await tx.promotionProposal.update({
        where: { id },
        data: {
          status: dto.status,
          approvedById: dto.approvedById,
          approvedAt:
            dto.status === 'APPROVED'
              ? dto.approvedAt
                ? new Date(dto.approvedAt)
                : new Date()
              : null,
          rejectedAt: dto.status === 'REJECTED' ? new Date() : null,
        },
      });

      if (dto.status === 'APPROVED') {
        await this.applyPromotion(tx, proposal, dto);
      }

      return updatedProposal;
    });

    return mapPromotionProposal(reviewedProposal);
  }

  private async applyPromotion(
    tx: Prisma.TransactionClient,
    proposal: {
      userId: string;
      toPositionId: string | null;
      approvedById: string | null;
      user: {
        employment: {
          id: string;
          employeeCode: string | null;
          employmentType: string;
          managerEmploymentId: string | null;
          hiredAt: Date | null;
          positionId: string | null;
        } | null;
      };
    },
    dto: ReviewPromotionProposalDto,
  ) {
    const employment = proposal.user.employment;
    if (!employment) {
      throw new BadRequestException(
        'Promotion approval requires an existing employment record',
      );
    }
    if (!proposal.toPositionId) {
      throw new BadRequestException(
        'Promotion proposal is missing a target position',
      );
    }

    const targetPosition = await tx.position.findUnique({
      where: { id: proposal.toPositionId },
      select: {
        id: true,
        departmentId: true,
        grade: {
          select: {
            code: true,
            minSalary: true,
            maxSalary: true,
          },
        },
      },
    });
    if (!targetPosition) {
      throw new NotFoundException('Target position not found');
    }

    await tx.userEmployment.update({
      where: { id: employment.id },
      data: {
        positionId: proposal.toPositionId,
      },
    });

    await tx.userEmploymentHistory.updateMany({
      where: {
        userEmploymentId: employment.id,
        effectiveTo: null,
      },
      data: {
        effectiveTo: new Date(),
      },
    });

    await tx.userEmploymentHistory.create({
      data: {
        userEmploymentId: employment.id,
        employeeCode: employment.employeeCode,
        departmentId: targetPosition.departmentId,
        positionId: targetPosition.id,
        employmentType: employment.employmentType as never,
        managerEmploymentId: employment.managerEmploymentId,
        effectiveFrom: dto.approvedAt ? new Date(dto.approvedAt) : new Date(),
        changeReason: 'Promotion approved',
        changedById: dto.approvedById,
      },
    });

    if (dto.compensationAdjustment?.baseSalary) {
      await this.assertSalaryWithinTargetBand(
        targetPosition.grade,
        dto.compensationAdjustment.baseSalary,
      );

      const effectiveFrom = dto.compensationAdjustment.effectiveFrom
        ? new Date(dto.compensationAdjustment.effectiveFrom)
        : dto.approvedAt
          ? new Date(dto.approvedAt)
          : new Date();

      await tx.userCompensationHistory.updateMany({
        where: {
          userId: proposal.userId,
          validFrom: { lt: effectiveFrom },
          OR: [{ validTo: null }, { validTo: { gte: effectiveFrom } }],
        },
        data: {
          validTo: new Date(effectiveFrom.getTime() - 1000),
        },
      });

      const compensation = await tx.userCompensation.upsert({
        where: { userId: proposal.userId },
        update: {
          baseSalary: dto.compensationAdjustment.baseSalary,
          ...(dto.compensationAdjustment.currency !== undefined
            ? { currency: dto.compensationAdjustment.currency }
            : {}),
          effectiveFrom,
        },
        create: {
          userId: proposal.userId,
          baseSalary: dto.compensationAdjustment.baseSalary,
          currency: dto.compensationAdjustment.currency,
          effectiveFrom,
        },
      });

      await tx.userCompensationHistory.create({
        data: {
          userId: proposal.userId,
          baseSalary: compensation.baseSalary,
          currency: compensation.currency,
          payFrequency: compensation.payFrequency,
          bonusEligible: compensation.bonusEligible,
          bonusRate: compensation.bonusRate,
          validFrom: effectiveFrom,
          validTo: compensation.effectiveTo,
          changeReason:
            dto.compensationAdjustment.changeReason ?? 'Promotion adjustment',
          changedById: dto.approvedById,
        },
      });
    }
  }

  private async assertSalaryWithinTargetBand(
    grade: {
      code: string;
      minSalary: unknown;
      maxSalary: unknown;
    } | null,
    baseSalary: string,
  ) {
    if (!grade) {
      return;
    }

    const salary = Number(baseSalary);
    const min = grade.minSalary != null ? Number(grade.minSalary) : null;
    const max = grade.maxSalary != null ? Number(grade.maxSalary) : null;
    if ((min != null && salary < min) || (max != null && salary > max)) {
      throw new BadRequestException(
        `Compensation adjustment must fall within the salary band for grade ${grade.code}`,
      );
    }
  }
}
