import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapCandidateResponse } from '../candidate.mapper';

@Injectable()
export class ListCandidatesForPostingUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(jobPostingId: string, filters: { status?: string }) {
    const posting = await this.prisma.jobPosting.findUnique({
      where: { id: jobPostingId },
      select: { id: true },
    });
    if (!posting) throw new NotFoundException('Job posting not found');

    const candidates = await this.prisma.candidate.findMany({
      where: {
        jobPostingId,
        ...(filters.status ? { status: filters.status as never } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        jobPosting: {
          select: {
            postingId: true,
            position: { select: { title: true } },
          },
        },
        _count: {
          select: {
            cvScreenings: true,
            interviewFeedback: true,
          },
        },
      },
    });

    return candidates.map(mapCandidateResponse);
  }
}
