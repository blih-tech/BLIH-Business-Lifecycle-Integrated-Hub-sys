import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { UpsertPerformanceCalibrationDto } from '@repo/types';
import { Prisma } from '../../../../platform/prisma/prisma-client';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import {
  calculateCategory,
  getRaiseRecommendation,
  isPromotionEligible,
} from '../performance-rating.utils';
import { mapPerformanceCalibrationResponse } from '../performance.mapper';

type CalibrationAdjustmentsPayload = NonNullable<
  UpsertPerformanceCalibrationDto['adjustments']
>;

@Injectable()
export class UpsertPerformanceCalibrationUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: UpsertPerformanceCalibrationDto) {
    await this.prisma.reviewPeriodConfig.findUniqueOrThrow({
      where: { id: dto.periodId },
    });

    if (dto.departmentId) {
      await this.prisma.department.findUniqueOrThrow({
        where: { id: dto.departmentId },
      });
    }

    if (dto.finalizedById) {
      const finalizer = await this.prisma.user.findUnique({
        where: { id: dto.finalizedById },
        select: { id: true },
      });
      if (!finalizer) {
        throw new NotFoundException('Finalizing user not found');
      }
    }

    const existing =
      dto.departmentId == null
        ? await this.prisma.performanceCalibration.findFirst({
            where: { periodId: dto.periodId, departmentId: null },
          })
        : await this.prisma.performanceCalibration.findUnique({
            where: {
              periodId_departmentId: {
                periodId: dto.periodId,
                departmentId: dto.departmentId,
              },
            },
          });

    const calibration = await this.prisma.$transaction(async (tx) => {
      const saved = existing
        ? await tx.performanceCalibration.update({
            where: { id: existing.id },
            data: {
              adjustments: (dto.adjustments ?? null) as never,
              finalizedById: dto.finalizedById ?? null,
              finalizedAt: dto.finalizedAt ? new Date(dto.finalizedAt) : null,
            },
          })
        : await tx.performanceCalibration.create({
            data: {
              periodId: dto.periodId,
              departmentId: dto.departmentId ?? null,
              adjustments: (dto.adjustments ?? null) as never,
              finalizedById: dto.finalizedById ?? null,
              finalizedAt: dto.finalizedAt ? new Date(dto.finalizedAt) : null,
            },
          });

      if (dto.adjustments?.reviewAdjustments?.length) {
        await this.applyAdjustments(tx, dto.periodId, dto.adjustments);
      }

      return saved;
    });

    return mapPerformanceCalibrationResponse(calibration);
  }

  private async applyAdjustments(
    tx: Prisma.TransactionClient,
    periodId: string,
    adjustments: CalibrationAdjustmentsPayload,
  ) {
    for (const adjustment of adjustments.reviewAdjustments ?? []) {
      const review = await tx.performanceReview.findUnique({
        where: { id: adjustment.reviewId },
        select: { id: true, periodConfigId: true },
      });
      if (!review) {
        throw new NotFoundException(
          `Performance review ${adjustment.reviewId} not found`,
        );
      }
      if (review.periodConfigId !== periodId) {
        throw new BadRequestException(
          `Performance review ${adjustment.reviewId} does not belong to the calibration period`,
        );
      }

      const finalRating =
        adjustment.finalRating !== undefined
          ? adjustment.finalRating
          : undefined;
      const category =
        adjustment.category !== undefined
          ? adjustment.category
          : finalRating != null
            ? calculateCategory(finalRating)
            : undefined;
      const promotionEligible =
        adjustment.promotionEligible !== undefined
          ? adjustment.promotionEligible
          : category != null
            ? isPromotionEligible(category)
            : undefined;
      const raiseRecommendation =
        adjustment.raiseRecommendation !== undefined
          ? adjustment.raiseRecommendation
          : category != null
            ? getRaiseRecommendation(category)
            : undefined;

      await tx.performanceReview.update({
        where: { id: review.id },
        data: {
          ...(finalRating !== undefined ? { finalRating } : {}),
          ...(category !== undefined ? { category } : {}),
          ...(promotionEligible !== undefined ? { promotionEligible } : {}),
          ...(raiseRecommendation !== undefined
            ? { raiseRecommendation: raiseRecommendation as never }
            : {}),
        },
      });
    }
  }
}
