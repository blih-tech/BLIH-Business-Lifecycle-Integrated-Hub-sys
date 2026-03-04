import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import { RecruitmentNotificationService } from '../recruitment/recruitment-notification.service';

@Injectable()
export class RecruitmentPostingLifecycleJob {
  private readonly logger = new Logger(RecruitmentPostingLifecycleJob.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: RecruitmentNotificationService,
  ) {}

  @Cron('0 30 1 * * *')
  async run(): Promise<void> {
    const now = new Date();
    const twentyFiveDaysAgo = new Date(
      now.getTime() - 25 * 24 * 60 * 60 * 1000,
    );
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const expiring = await this.prisma.jobPosting.findMany({
      where: {
        status: 'PUBLISHED',
        OR: [
          {
            expiresAt: {
              lte: now,
            },
          },
          {
            postedAt: {
              lte: ninetyDaysAgo,
            },
          },
        ],
      },
      select: { id: true },
    });

    if (expiring.length > 0) {
      await this.prisma.jobPosting.updateMany({
        where: {
          id: { in: expiring.map((posting) => posting.id) },
        },
        data: {
          status: 'EXPIRED',
          closedAt: now,
        },
      });
    }

    const extensionCandidates = await this.prisma.jobPosting.findMany({
      where: {
        status: 'PUBLISHED',
        postedAt: { lte: twentyFiveDaysAgo, not: null },
        expiresAt: { gt: now },
      },
      include: {
        recruitmentRequest: {
          select: {
            submittedById: true,
          },
        },
        _count: {
          select: {
            candidates: true,
          },
        },
      },
    });

    let extendedCount = 0;
    for (const posting of extensionCandidates) {
      if (
        posting._count.candidates >= 5 ||
        !posting.postedAt ||
        !posting.expiresAt
      ) {
        continue;
      }

      const originalExpiry = new Date(
        posting.postedAt.getTime() + 30 * 24 * 60 * 60 * 1000,
      );
      if (posting.expiresAt.getTime() !== originalExpiry.getTime()) {
        continue;
      }

      const extendedUntil = new Date(
        posting.expiresAt.getTime() + 7 * 24 * 60 * 60 * 1000,
      );
      await this.prisma.jobPosting.update({
        where: { id: posting.id },
        data: {
          expiresAt: extendedUntil,
        },
      });

      await this.notifications.notifyUsers({
        userIds: [posting.recruitmentRequest.submittedById],
        title: `Job posting ${posting.postingId} auto-extended`,
        body: `Posting received only ${posting._count.candidates} applications by day 25 and has been extended to ${extendedUntil.toISOString().slice(0, 10)}.`,
        payload: {
          jobPostingId: posting.id,
          candidatesCount: posting._count.candidates,
          extendedUntil: extendedUntil.toISOString(),
        },
      });

      extendedCount += 1;
    }

    this.logger.log(
      `Recruitment posting lifecycle processed ${expiring.length} expiries and ${extendedCount} auto-extensions`,
    );
  }
}
