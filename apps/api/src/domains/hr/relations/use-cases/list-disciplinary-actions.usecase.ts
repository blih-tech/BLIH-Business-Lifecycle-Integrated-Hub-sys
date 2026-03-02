import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapDisciplinaryAction } from '../relations.mapper';

@Injectable()
export class ListDisciplinaryActionsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(filters: { userId?: string }) {
    const where: { userId?: string } = {};
    if (filters.userId) where.userId = filters.userId;
    const list = await this.prisma.disciplinaryAction.findMany({
      where,
      orderBy: { effectiveFrom: 'desc' },
    });
    return list.map(mapDisciplinaryAction);
  }
}
