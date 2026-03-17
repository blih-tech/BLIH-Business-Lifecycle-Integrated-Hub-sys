import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapSurvey } from '../relations.mapper';

@Injectable()
export class ListSurveysUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(filters: { status?: string }) {
    const where: Record<string, string> = {};
    if (filters.status) where.status = filters.status;
    const list = await this.prisma.survey.findMany({
      where: where as never,
      orderBy: { createdAt: 'desc' },
    });
    return list.map(mapSurvey);
  }
}
