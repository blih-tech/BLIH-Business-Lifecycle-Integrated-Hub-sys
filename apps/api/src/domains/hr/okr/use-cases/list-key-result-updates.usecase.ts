import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapKeyResultUpdateResponse } from '../okr.mapper';

@Injectable()
export class ListKeyResultUpdatesUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(okrId: string, krId: string) {
    const keyResult = await this.prisma.keyResult.findFirst({
      where: { id: krId, okrId },
      select: { id: true },
    });
    if (!keyResult) {
      throw new NotFoundException('Key result not found');
    }

    const updates = await this.prisma.keyResultUpdate.findMany({
      where: { keyResultId: krId },
      orderBy: [{ createdAt: 'desc' }],
    });

    return updates.map(mapKeyResultUpdateResponse);
  }
}
