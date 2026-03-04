import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapDisciplinaryAction } from '../relations.mapper';

@Injectable()
export class ListDisciplinaryActionsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(filters: { employeeId?: string }) {
    const where: { employeeId?: string } = {};
    if (filters.employeeId) where.employeeId = filters.employeeId;
    const list = await this.prisma.disciplinaryAction.findMany({
      where,
      orderBy: { effectiveFrom: 'desc' },
    });
    return list.map(mapDisciplinaryAction);
  }
}
