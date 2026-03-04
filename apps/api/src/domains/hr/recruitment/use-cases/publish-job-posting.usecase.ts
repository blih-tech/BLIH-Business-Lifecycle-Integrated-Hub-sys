import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapJobPostingResponse } from '../job-posting.mapper';
import { RecruitmentNotificationService } from '../recruitment-notification.service';

function asRecord(value: unknown): Record<string, unknown> | null {
  return value != null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function readNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  if (value && typeof value === 'object' && 'toNumber' in value) {
    const parsed = (value as { toNumber?: () => number }).toNumber?.();
    return typeof parsed === 'number' && Number.isFinite(parsed)
      ? parsed
      : null;
  }
  return null;
}

@Injectable()
export class PublishJobPostingUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: RecruitmentNotificationService,
  ) {}

  async execute(id: string) {
    const posting = await this.prisma.jobPosting.findUnique({
      where: { id },
      include: {
        recruitmentRequest: {
          select: {
            id: true,
            requestId: true,
            status: true,
            staffing: true,
            submittedById: true,
          },
        },
        position: {
          select: {
            title: true,
            grade: {
              select: {
                minSalary: true,
                maxSalary: true,
              },
            },
          },
        },
        _count: { select: { candidates: true } },
      },
    });

    if (!posting) throw new NotFoundException('Job posting not found');
    if (!['DRAFT', 'APPROVED', 'PENDING_APPROVAL'].includes(posting.status)) {
      throw new BadRequestException(
        'Only open draft job postings can be published',
      );
    }
    if (
      !['APPROVED', 'COMPLETED'].includes(posting.recruitmentRequest.status)
    ) {
      throw new BadRequestException(
        'Recruitment request must be approved before publishing',
      );
    }

    const prerequisites = asRecord(posting.prerequisites);
    const techSkills = Array.isArray(prerequisites?.techSkills)
      ? prerequisites.techSkills
      : [];
    if (techSkills.length < 3) {
      throw new BadRequestException(
        'Job posting must define at least 3 technical skills before publication',
      );
    }

    const staffing = asRecord(posting.recruitmentRequest.staffing);
    const salaryBracket = asRecord(staffing?.salaryBracket);
    const minSalary =
      readNumber(salaryBracket?.min) ??
      readNumber(posting.position?.grade?.minSalary) ??
      null;
    const maxSalary =
      readNumber(salaryBracket?.max) ??
      readNumber(posting.position?.grade?.maxSalary) ??
      null;

    if (minSalary != null && maxSalary != null && minSalary > maxSalary) {
      throw new BadRequestException(
        'Salary range is invalid for this job posting',
      );
    }

    const postedAt = new Date();
    const expiresAt =
      posting.expiresAt ??
      new Date(postedAt.getTime() + 30 * 24 * 60 * 60 * 1000);

    const published = await this.prisma.jobPosting.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        postedAt,
        expiresAt,
        closedAt: null,
      },
      include: {
        position: { select: { title: true } },
        _count: { select: { candidates: true } },
      },
    });

    await this.notifications.notifyUsers({
      userIds: [posting.recruitmentRequest.submittedById],
      title: `Job posting ${posting.postingId} published`,
      body: `Job posting for ${posting.position?.title ?? posting.postingId} is now live until ${expiresAt.toISOString().slice(0, 10)}.`,
      payload: {
        jobPostingId: posting.id,
        recruitmentRequestId: posting.recruitmentRequest.id,
      },
    });

    return mapJobPostingResponse(published);
  }
}
