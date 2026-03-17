import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import { mapPosition } from '../positions.mapper';
import { ListPositionsQueryDto } from '../dto/list-positions-query.dto';

@Injectable()
export class ListPositionsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query?: ListPositionsQueryDto) {
    const positions = await this.prisma.position.findMany({
      where: {
        ...(query?.departmentId ? { departmentId: query.departmentId } : {}),
        ...(query?.isActive !== undefined ? { isActive: query.isActive } : {}),
      },
      include: {
        department: {
          select: {
            name: true,
          },
        },
        grade: {
          select: {
            code: true,
            name: true,
            level: true,
          },
        },
      },
      orderBy: [{ title: 'asc' }],
    });

    return positions.map(mapPosition);
  }
}
