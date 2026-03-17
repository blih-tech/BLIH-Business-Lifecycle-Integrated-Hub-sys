import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapOkrResponse } from '../okr.mapper';

@Injectable()
export class GetOkrUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string) {
    const okr = await this.prisma.okr.findUnique({
      where: { id },
      include: {
        department: { select: { name: true } },
        keyResults: { orderBy: { sortOrder: 'asc' } },
      },
    });
    if (!okr) throw new NotFoundException('OKR not found');
    return mapOkrResponse(okr);
  }
}
