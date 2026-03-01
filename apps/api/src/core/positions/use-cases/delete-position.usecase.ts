import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';

@Injectable()
export class DeletePositionUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(positionId: string) {
    const existing = await this.prisma.position.findUnique({
      where: { id: positionId },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Position not found');
    }

    await this.prisma.position.delete({
      where: { id: positionId },
    });

    return { success: true };
  }
}
