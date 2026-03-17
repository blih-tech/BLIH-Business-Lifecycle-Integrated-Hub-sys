import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { ReweightKeyResultsDto } from '@repo/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { computeOkrOverall } from '../okr-progress.utils';
import { mapOkrResponse } from '../okr.mapper';

@Injectable()
export class ReweightKeyResultsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(okrId: string, dto: ReweightKeyResultsDto) {
    const okr = await this.prisma.okr.findUnique({
      where: { id: okrId },
      include: {
        department: { select: { name: true } },
        keyResults: { orderBy: { sortOrder: 'asc' } },
      },
    });
    if (!okr) {
      throw new NotFoundException('OKR not found');
    }

    if (dto.weights.length !== okr.keyResults.length) {
      throw new BadRequestException(
        'Weights payload must include every key result in the OKR',
      );
    }

    const weightMap = new Map(
      dto.weights.map((entry) => [entry.keyResultId, entry.weight]),
    );
    const total = dto.weights.reduce((sum, entry) => sum + entry.weight, 0);
    if (total !== 100) {
      throw new BadRequestException(
        `Key result weights must total 100, received ${total}`,
      );
    }

    for (const keyResult of okr.keyResults) {
      if (!weightMap.has(keyResult.id)) {
        throw new BadRequestException(
          `Missing weight for key result ${keyResult.id}`,
        );
      }
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      await Promise.all(
        dto.weights.map((entry) =>
          tx.keyResult.update({
            where: { id: entry.keyResultId },
            data: { weight: entry.weight },
          }),
        ),
      );

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

      return tx.okr.update({
        where: { id: okrId },
        data: {
          overallProgress: overall.overallProgress,
          overallStatus: overall.overallStatus,
        },
        include: {
          department: { select: { name: true } },
          keyResults: { orderBy: { sortOrder: 'asc' } },
        },
      });
    });

    return mapOkrResponse(updated);
  }
}
