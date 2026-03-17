import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { UpdateKeyResultDto } from '@repo/types';
import { Prisma } from '../../../../platform/prisma/prisma-client';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import {
  computeKeyResultProgress,
  computeOkrOverall,
} from '../okr-progress.utils';
import { mapKeyResultResponse } from '../okr.mapper';

@Injectable()
export class UpdateKeyResultUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(okrId: string, krId: string, dto: UpdateKeyResultDto) {
    const keyResult = await this.prisma.keyResult.findFirst({
      where: { id: krId, okrId },
      include: { okr: { include: { keyResults: true } } },
    });
    if (!keyResult) throw new NotFoundException('Key result not found');

    const nextCurrentValue =
      dto.currentValue !== undefined
        ? dto.currentValue
        : keyResult.currentValue != null
          ? Number(keyResult.currentValue)
          : null;
    const nextProgress = computeKeyResultProgress(
      keyResult.type as 'NUMERIC' | 'PERCENTAGE' | 'BOOLEAN' | 'MILESTONE',
      Number(keyResult.targetValue),
      nextCurrentValue,
    );

    if (dto.currentValue !== undefined && !dto.updatedById) {
      throw new BadRequestException(
        'updatedById is required when recording a key result check-in',
      );
    }

    if (dto.updatedById) {
      const user = await this.prisma.user.findUnique({
        where: { id: dto.updatedById },
        select: { id: true },
      });
      if (!user) {
        throw new NotFoundException('Check-in actor not found');
      }
    }

    const updatedKeyResult = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.keyResult.update({
        where: { id: krId },
        data: {
          ...(dto.title !== undefined ? { title: dto.title } : {}),
          ...(dto.currentValue !== undefined
            ? { currentValue: dto.currentValue }
            : {}),
          ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
          progress: nextProgress.progress,
          status: nextProgress.status,
        },
      });

      if (dto.currentValue !== undefined && dto.updatedById) {
        await tx.keyResultUpdate.create({
          data: {
            keyResultId: krId,
            previousValue: keyResult.currentValue,
            newValue: dto.currentValue ?? 0,
            comment: dto.comment ?? null,
            updatedById: dto.updatedById,
          },
        });
      }

      await this.recomputeOkr(tx, okrId);
      return updated;
    });

    return mapKeyResultResponse(updatedKeyResult);
  }

  private async recomputeOkr(tx: Prisma.TransactionClient, okrId: string) {
    const keyResults = await tx.keyResult.findMany({
      where: { okrId },
      orderBy: { sortOrder: 'asc' },
    });
    const overall = computeOkrOverall(
      keyResults.map((keyResult) => ({
        progress: keyResult.progress,
        status: keyResult.status,
        weight: keyResult.weight,
      })),
    );

    await tx.okr.update({
      where: { id: okrId },
      data: {
        overallProgress: overall.overallProgress,
        overallStatus: overall.overallStatus,
      },
    });
  }
}
