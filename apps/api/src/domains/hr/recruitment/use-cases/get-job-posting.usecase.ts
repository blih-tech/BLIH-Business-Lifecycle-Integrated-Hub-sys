import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapJobPostingResponse } from '../job-posting.mapper';

@Injectable()
export class GetJobPostingUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string) {
    const posting = await this.prisma.jobPosting.findUnique({
      where: { id },
      include: {
        position: { select: { title: true } },
        _count: { select: { candidates: true } },
      },
    });

    if (!posting) throw new NotFoundException('Job posting not found');
    return mapJobPostingResponse(posting);
  }
}
