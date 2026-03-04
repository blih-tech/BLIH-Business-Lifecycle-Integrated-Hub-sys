import { Injectable, NotFoundException } from '@nestjs/common';
import type { UpdateCandidateDto } from '@repo/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapCandidateResponse } from '../candidate.mapper';

@Injectable()
export class UpdateCandidateUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, dto: UpdateCandidateDto) {
    const existing = await this.prisma.candidate.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Candidate not found');

    const candidate = await this.prisma.candidate.update({
      where: { id },
      data: {
        source: dto.source ?? undefined,
        referralUserId:
          dto.referralUserId === undefined ? undefined : dto.referralUserId,
        email: dto.email === undefined ? undefined : dto.email,
        phone: dto.phone === undefined ? undefined : dto.phone,
        firstName: dto.firstName === undefined ? undefined : dto.firstName,
        lastName: dto.lastName === undefined ? undefined : dto.lastName,
        personalInfo:
          dto.personalInfo === undefined
            ? undefined
            : (dto.personalInfo as never),
        career: dto.career === undefined ? undefined : (dto.career as never),
        applicationResponses:
          dto.applicationResponses === undefined
            ? undefined
            : (dto.applicationResponses as never),
        pipeline:
          dto.pipeline === undefined ? undefined : (dto.pipeline as never),
        rejection:
          dto.rejection === undefined ? undefined : (dto.rejection as never),
      },
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

    return mapCandidateResponse(candidate);
  }
}
