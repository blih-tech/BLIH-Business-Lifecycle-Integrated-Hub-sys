import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapJobPostingResponse } from '../job-posting.mapper';

@Injectable()
export class ListJobPostingsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(filters: { status?: string; departmentId?: string }) {
    const list = await this.prisma.jobPosting.findMany({
      where: {
        ...(filters.status ? { status: filters.status as never } : {}),
        ...(filters.departmentId
          ? {
              recruitmentRequest: {
                departmentId: filters.departmentId,
              },
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        position: { select: { title: true } },
        _count: { select: { candidates: true } },
      },
    });

    return list.map(mapJobPostingResponse);
  }
}
