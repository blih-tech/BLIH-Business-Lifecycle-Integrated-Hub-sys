import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import type { CreateJobPostingDto } from '@repo/types';
import { validateRecruitmentRequestInput } from '../recruitment-request.validation';

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
    if (request.linkedJobPostingId) {
      throw new BadRequestException(
        'This recruitment request already has a linked job posting',
      );
    }

    await validateRecruitmentRequestInput(this.prisma, {
      departmentId: request.departmentId,
      positionId: request.positionId,
      type: request.type,
      replacementEmployeeId: request.replacementEmployeeId,
      requirePosition: true,
      enforceHeadcount: true,
    });

    const year = new Date().getFullYear();
    const count = await this.prisma.jobPosting.count({
      where: { postingId: { startsWith: `POST-${year}-` } },
    });
    const postingId = `POST-${year}-${String(count + 1).padStart(3, '0')}`;

    const positionSnapshot =
      dto.positionSnapshot ??
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
        positionId: request.positionId ?? undefined,
        positionSnapshot: (positionSnapshot ?? undefined) as object | undefined,
        description: (dto.description ?? undefined) as object | undefined,
        prerequisites: (dto.prerequisites ?? undefined) as object | undefined,
        kpis: (dto.kpis ?? undefined) as object | undefined,
        platforms: dto.platforms ?? [],
        status: 'DRAFT',
      },
      include: {
        recruitmentRequest: { select: { requestId: true } },
        position: { select: { id: true, title: true } },
      },
    });

    await this.prisma.recruitmentRequest.update({
      where: { id: requestId },
      data: { linkedJobPostingId: posting.id },
    });

    const withPos = posting as typeof posting & {
      position: { id: string; title: string } | null;
    };
    return {
      id: withPos.id,
      postingId: withPos.postingId,
      recruitmentRequestId: withPos.recruitmentRequestId,
      positionId: withPos.positionId ?? null,
      positionTitle: withPos.position?.title ?? null,
      positionSnapshot: withPos.positionSnapshot,
      description: withPos.description,
      prerequisites: withPos.prerequisites,
      kpis: withPos.kpis,
      platforms: withPos.platforms,
      status: withPos.status,
      postedAt: withPos.postedAt?.toISOString() ?? null,
      expiresAt: withPos.expiresAt?.toISOString() ?? null,
      closedAt: withPos.closedAt?.toISOString() ?? null,
      createdAt: withPos.createdAt.toISOString(),
      updatedAt: withPos.updatedAt.toISOString(),
    };
  }
}
