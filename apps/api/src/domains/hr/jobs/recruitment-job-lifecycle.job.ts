import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import { RecruitmentNotificationService } from '../recruitment/recruitment-notification.service';

@Injectable()
export class RecruitmentJobLifecycleJob {
  private readonly logger = new Logger(RecruitmentJobLifecycleJob.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: RecruitmentNotificationService,
  ) {}

  @Cron('0 30 1 * * *')
  async run(): Promise<void> {
    const now = new Date();
    const closedByDeadline = await this.closeJobsByDeadline(now);
    const closedByFilledOpenings = await this.closeFilledJobs();

    this.logger.log(
      `Recruitment lifecycle processed ${closedByDeadline} deadline closures and ${closedByFilledOpenings} filled-position closures`,
    );
  }

  private async closeJobsByDeadline(now: Date): Promise<number> {
    const jobs = await this.prisma.job.findMany({
      where: {
        status: 'PUBLISHED',
        applicationDeadline: { lte: now },
      },
      select: {
        id: true,
        title: true,
        createdById: true,
        applicationDeadline: true,
      },
    });

    if (jobs.length === 0) return 0;

    await this.prisma.job.updateMany({
      where: { id: { in: jobs.map((job) => job.id) } },
      data: {
        status: 'CLOSED',
        closedAt: now,
        closingReason: 'APPLICATION_DEADLINE_PASSED',
      },
    });

    for (const job of jobs) {
      await this.notifications.notifyUsers({
        userIds: [job.createdById],
        title: `Job ${job.title} closed`,
        body: `The application deadline ${
          job.applicationDeadline?.toISOString().slice(0, 10) ?? 'has passed'
        } and the job was auto-closed.`,
        payload: {
          jobId: job.id,
          reason: 'APPLICATION_DEADLINE_PASSED',
        },
      });
    }

    return jobs.length;
  }

  private async closeFilledJobs(): Promise<number> {
    const jobs = await this.prisma.job.findMany({
      where: { status: 'PUBLISHED' },
      select: {
        id: true,
        title: true,
        openings: true,
        createdById: true,
        _count: {
          select: {
            applications: {
              where: { status: 'HIRED' },
            },
          },
        },
      },
    });

    const filledJobs = jobs.filter(
      (job) => job.openings > 0 && job._count.applications >= job.openings,
    );
    if (filledJobs.length === 0) return 0;

    await this.prisma.job.updateMany({
      where: { id: { in: filledJobs.map((job) => job.id) } },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
        closingReason: 'OPENINGS_FILLED',
      },
    });

    for (const job of filledJobs) {
      await this.notifications.notifyUsers({
        userIds: [job.createdById],
        title: `Job ${job.title} closed`,
        body: `The job reached the required openings (${job.openings}) and was auto-closed.`,
        payload: {
          jobId: job.id,
          reason: 'OPENINGS_FILLED',
          hiredCount: job._count.applications,
        },
      });
    }

    return filledJobs.length;
  }
}
