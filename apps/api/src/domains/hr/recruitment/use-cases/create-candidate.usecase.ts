import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { CreateCandidateDto } from '@repo/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapCandidateResponse } from '../candidate.mapper';
import { RecruitmentNotificationService } from '../recruitment-notification.service';

@Injectable()
export class CreateCandidateUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: RecruitmentNotificationService,
  ) {}

  async execute(dto: CreateCandidateDto) {
    const posting = await this.prisma.jobPosting.findUnique({
      where: { id: dto.jobPostingId },
      include: {
        recruitmentRequest: {
          select: {
            id: true,
            submittedById: true,
          },
        },
        position: { select: { title: true } },
      },
    });

    if (!posting) throw new NotFoundException('Job posting not found');
    if (posting.status !== 'PUBLISHED') {
      throw new BadRequestException(
        'Applications can only be submitted to published job postings',
      );
    }

    if (dto.email) {
      const duplicate = await this.prisma.candidate.findFirst({
        where: {
          jobPostingId: dto.jobPostingId,
          email: dto.email,
        },
        select: { id: true },
      });
      if (duplicate) {
        throw new ConflictException(
          'Candidate has already applied to this job posting',
        );
      }
    }

    const year = new Date().getFullYear();
    const count = await this.prisma.candidate.count({
      where: { candidateId: { startsWith: `CAND-${year}-` } },
    });
    const candidateId = `CAND-${year}-${String(count + 1).padStart(4, '0')}`;
    const appliedAt = new Date();

    const candidate = await this.prisma.candidate.create({
      data: {
        candidateId,
        jobPostingId: dto.jobPostingId,
        source: dto.source ?? 'COMPANY_SITE',
        referralUserId: dto.referralUserId ?? undefined,
        email: dto.email ?? undefined,
        phone: dto.phone ?? undefined,
        firstName: dto.firstName ?? undefined,
        lastName: dto.lastName ?? undefined,
        personalInfo: (dto.personalInfo ?? undefined) as object | undefined,
        career: (dto.career ?? undefined) as object | undefined,
        applicationResponses: (dto.applicationResponses ?? undefined) as
          | object
          | undefined,
        pipeline: {
          appliedAt: appliedAt.toISOString(),
          stageHistory: [
            {
              status: 'NEW',
              at: appliedAt.toISOString(),
            },
          ],
        },
        status: 'NEW',
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

    await this.notifications.notifyUsers({
      userIds: [posting.recruitmentRequest.submittedById],
      title: `New application for ${posting.position?.title ?? posting.postingId}`,
      body:
        `${dto.firstName ?? 'A candidate'} ${dto.lastName ?? ''}`.trim() +
        ` submitted an application for ${posting.position?.title ?? posting.postingId}.`,
      payload: {
        candidateId: candidate.id,
        jobPostingId: posting.id,
      },
    });

    return mapCandidateResponse(candidate);
  }
}
