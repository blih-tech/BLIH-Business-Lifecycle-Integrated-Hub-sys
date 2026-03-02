import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapRecognition } from '../relations.mapper';

@Injectable()
export class ListRecognitionsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(filters: { nomineeId?: string; status?: string }) {
    const where: Record<string, string> = {};
    if (filters.nomineeId) where.nomineeId = filters.nomineeId;
    if (filters.status) where.status = filters.status;
    const list = await this.prisma.recognition.findMany({
      where: where as never,
      orderBy: { createdAt: 'desc' },
    });
    return list.map(mapRecognition);
  }
}
