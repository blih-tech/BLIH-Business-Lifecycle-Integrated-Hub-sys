import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import type { CreateJobPostingDto } from '@blih/types';

@Injectable()
export class CreateJobPostingFromRequestUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    requestId: string,
    dto: Omit<CreateJobPostingDto, 'recruitmentRequestId'>,
  ) {
    const request = await this.prisma.recruitmentRequest.findUnique({
      where: { id: requestId },
      include: { department: true, position: true },
    });
    if (!request) throw new NotFoundException('Recruitment request not found');
    if (request.status !== 'APPROVED')
      throw new NotFoundException(
        'Only approved requests can create job postings',
      );

    const year = new Date().getFullYear();
    const count = await this.prisma.jobPosting.count({
      where: { postingId: { startsWith: `POST-${year}-` } },
    });
    const postingId = `POST-${year}-${String(count + 1).padStart(3, '0')}`;

    const positionPayload =
      dto.position ??
      (request.position
        ? {
            job_name: request.position.title,
            team_id: request.departmentId,
            work_type: 'FULL_TIME',
            work_mode: 'HYBRID',
          }
        : undefined);

    const posting = await this.prisma.jobPosting.create({
      data: {
        postingId,
        recruitmentRequestId: requestId,
        position: (positionPayload ?? undefined) as object | undefined,
        description: (dto.description ?? undefined) as object | undefined,
        prerequisites: (dto.prerequisites ?? undefined) as object | undefined,
        kpis: (dto.kpis ?? undefined) as object | undefined,
        platforms: dto.platforms ?? [],
        status: 'DRAFT',
      },
      include: {
        recruitmentRequest: { select: { requestId: true } },
      },
    });

    await this.prisma.recruitmentRequest.update({
      where: { id: requestId },
      data: { linkedJobPostingId: posting.id },
    });

    return {
      id: posting.id,
      postingId: posting.postingId,
      recruitmentRequestId: posting.recruitmentRequestId,
      position: posting.position,
      description: posting.description,
      prerequisites: posting.prerequisites,
      kpis: posting.kpis,
      platforms: posting.platforms,
      status: posting.status,
      postedAt: posting.postedAt?.toISOString() ?? null,
      expiresAt: posting.expiresAt?.toISOString() ?? null,
      closedAt: posting.closedAt?.toISOString() ?? null,
      createdAt: posting.createdAt.toISOString(),
      updatedAt: posting.updatedAt.toISOString(),
    };
  }
}
