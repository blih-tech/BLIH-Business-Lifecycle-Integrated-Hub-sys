import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapExitInterview } from '../offboarding.mapper';

@Injectable()
export class ListExitInterviewsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(filters: { employeeId?: string; resignationId?: string }) {
    const where: Record<string, string> = {};
    if (filters.employeeId) where.employeeId = filters.employeeId;
    if (filters.resignationId) where.resignationId = filters.resignationId;
    const list = await this.prisma.exitInterview.findMany({
      where: where as never,
      orderBy: { createdAt: 'desc' },
    });
    return list.map(mapExitInterview);
  }
}
