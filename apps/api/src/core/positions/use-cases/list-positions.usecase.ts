import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import { mapPosition } from '../positions.mapper';

@Injectable()
export class ListPositionsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute() {
    const positions = await this.prisma.position.findMany({
      include: {
        department: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [{ title: 'asc' }],
    });

    return positions.map(mapPosition);
  }
}
