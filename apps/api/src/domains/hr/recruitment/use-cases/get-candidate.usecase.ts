import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapCandidateResponse } from '../candidate.mapper';

@Injectable()
export class GetCandidateUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id },
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

    if (!candidate) throw new NotFoundException('Candidate not found');
    return mapCandidateResponse(candidate);
  }
}
