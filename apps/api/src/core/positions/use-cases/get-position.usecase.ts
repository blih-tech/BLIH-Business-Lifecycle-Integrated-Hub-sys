import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import { mapPosition } from '../positions.mapper';

@Injectable()
export class GetPositionUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(positionId: string) {
    const position = await this.prisma.position.findUnique({
      where: { id: positionId },
      include: {
        department: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!position) {
      throw new NotFoundException('Position not found');
    }

    return mapPosition(position);
  }
}
