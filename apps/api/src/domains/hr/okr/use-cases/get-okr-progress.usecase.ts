import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapOkrProgressResponse } from '../okr.mapper';

@Injectable()
export class GetOkrProgressUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(okrId: string) {
    const okr = await this.prisma.okr.findUnique({
      where: { id: okrId },
      include: { keyResults: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!okr) throw new NotFoundException('OKR not found');
    return mapOkrProgressResponse(
      okr.id,
      okr.overallProgress,
      okr.overallStatus,
      okr.keyResults.map((keyResult) => ({
        id: keyResult.id,
        title: keyResult.title,
        progress: keyResult.progress,
        status: keyResult.status,
        weight: keyResult.weight,
      })),
    );
  }
}
