import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../../../platform/prisma/prisma-client';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import type {
  CreateJobApplicationDto,
  JobApplicationListQueryDto,
  UpdateApplicationStatusDto,
} from '../dto/application.dto';
import { RecruitmentNotificationService } from '../recruitment-notification.service';
import {
  assertApplicationTransition,
  mapApplication,
} from './recruitment.usecase-helpers';

@Injectable()
export class CreateJobApplicationUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: RecruitmentNotificationService,
  ) {}

  async execute(dto: CreateJobApplicationDto) {
    const [job, candidate] = await Promise.all([
      this.prisma.job.findUnique({
        where: { id: dto.jobId },
        select: { id: true, status: true, createdById: true, title: true },
      }),
      this.prisma.candidate.findUnique({
        where: { id: dto.candidateId },
        select: { id: true, fullName: true, source: true },
      }),
    ]);
    if (!job) throw new NotFoundException('Job not found');
    if (!candidate) throw new NotFoundException('Candidate not found');
    if (job.status !== 'PUBLISHED') {
      throw new BadRequestException(
        'Applications are allowed only for published jobs',
      );
    }

    const duplicate = await this.prisma.jobApplication.findUnique({
      where: {
        jobId_candidateId: { jobId: dto.jobId, candidateId: dto.candidateId },
      },
      select: { id: true },
    });
    if (duplicate) {
      throw new ConflictException('Candidate already applied to this job');
    }

    const application = await this.prisma.jobApplication.create({
      data: {
        jobId: dto.jobId,
        candidateId: dto.candidateId,
        customFieldValues: {
          coverLetter: dto.coverLetter ?? null,
          expectedSalary: dto.expectedSalary ?? null,
          sourceSnapshot: dto.sourceSnapshot ?? {
            candidateSource: candidate.source,
          },
        } as Prisma.InputJsonValue,
      },
    });

    await this.notifications.notifyUsers({
      userIds: [job.createdById],
      title: `New application for ${job.title}`,
      body: `${candidate.fullName} submitted an application.`,
      payload: {
        jobId: dto.jobId,
        candidateId: dto.candidateId,
        applicationId: application.id,
      },
    });

    return mapApplication(application);
  }
}

@Injectable()
export class ListJobApplicationsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: JobApplicationListQueryDto) {
    const list = await this.prisma.jobApplication.findMany({
      where: {
        ...(query.status ? { status: query.status } : {}),
        ...(query.jobId ? { jobId: query.jobId } : {}),
        ...(query.candidateId ? { candidateId: query.candidateId } : {}),
      },
      orderBy: { appliedAt: 'desc' },
    });
    return list.map((application) => mapApplication(application));
  }
}

@Injectable()
export class GetJobApplicationUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string) {
    const application = await this.prisma.jobApplication.findUnique({
      where: { id },
    });
    if (!application) throw new NotFoundException('Job application not found');
    return mapApplication(application);
  }
}

@Injectable()
export class UpdateJobApplicationStatusUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, dto: UpdateApplicationStatusDto) {
    const existing = await this.prisma.jobApplication.findUnique({
      where: { id },
      select: { id: true, status: true },
    });
    if (!existing) throw new NotFoundException('Job application not found');
    assertApplicationTransition(existing.status, dto.status);

    const updated = await this.prisma.jobApplication.update({
      where: { id },
      data: { status: dto.status },
    });
    return mapApplication(updated);
  }
}
