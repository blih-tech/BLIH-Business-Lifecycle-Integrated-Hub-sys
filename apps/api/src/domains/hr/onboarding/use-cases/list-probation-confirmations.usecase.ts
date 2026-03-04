import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapProbationConfirmationResponse } from '../probation.mapper';

@Injectable()
export class ListProbationConfirmationsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(filters: { employeeId?: string; verdict?: string }) {
    const list = await this.prisma.probationConfirmation.findMany({
      where: {
        ...(filters.employeeId ? { employeeId: filters.employeeId } : {}),
        ...(filters.verdict ? { verdict: filters.verdict as never } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    return list.map(mapProbationConfirmationResponse);
  }
}
