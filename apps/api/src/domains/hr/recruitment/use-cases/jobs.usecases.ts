import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SYSTEM_ROLES } from '../../../../shared/constants/system-roles.constant';
import type { AuthPrincipal } from '../../../../shared/interfaces/auth-principal.interface';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import type {
  ApproveJobDto,
  CloseJobDto,
  CreateJobDto,
  JobListQueryDto,
  UpdateJobDto,
  UpsertJobResponsibilitiesDto,
  UpsertJobSkillsDto,
  UpsertJobToolsDto,
} from '../dto/job.dto';
import {
  assertSalaryRange,
  currentApprovalStage,
  generateUniqueSlug,
  jobInclude,
  mapJob,
  requiredRoleForStage,
} from './recruitment.usecase-helpers';

@Injectable()
export class CreateJobUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateJobDto, principal: AuthPrincipal) {
    assertSalaryRange(dto.salaryMin ?? null, dto.salaryMax ?? null);
    const slug = await generateUniqueSlug(this.prisma, dto.title);
    const creatorId = principal.userId ?? principal.sub;
    const creatorIsHr =
      principal.roles?.includes(SYSTEM_ROLES.HR) ||
      principal.roles?.includes(SYSTEM_ROLES.HR_MANAGER) ||
      false;

    const created = await this.prisma.job.create({
      data: {
        title: dto.title,
        slug,
        departmentId: dto.departmentId ?? undefined,
        positionId: dto.positionId ?? undefined,
        description: dto.description,
        summary: dto.summary ?? undefined,
        experienceLevel: dto.experienceLevel ?? undefined,
        contractType: dto.contractType,
        employmentType: dto.employmentType ?? undefined,
        workLocationType: dto.workLocationType,
        remoteScope: dto.remoteScope ?? undefined,
        city: dto.city ?? undefined,
        country: dto.country ?? undefined,
        openings: dto.openings ?? 1,
        salaryMin: dto.salaryMin ?? undefined,
        salaryMax: dto.salaryMax ?? undefined,
        currency: dto.currency ?? undefined,
        benefits: dto.benefits ?? [],
        creatorIsHr,
        applicationDeadline: dto.applicationDeadline
          ? new Date(dto.applicationDeadline)
          : undefined,
        createdById: creatorId,
      },
      include: jobInclude,
    });

    return mapJob(created);
  }
}

@Injectable()
export class ListJobsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: JobListQueryDto) {
    const jobs = await this.prisma.job.findMany({
      where: {
        ...(query.status ? { status: query.status } : {}),
        ...(query.departmentId ? { departmentId: query.departmentId } : {}),
      },
      include: jobInclude,
      orderBy: { createdAt: 'desc' },
    });
    return jobs.map((job) => mapJob(job));
  }
}

@Injectable()
export class GetJobUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: jobInclude,
    });
    if (!job) throw new NotFoundException('Job not found');
    return mapJob(job);
  }
}

@Injectable()
export class UpdateJobUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, dto: UpdateJobDto) {
    const existing = await this.prisma.job.findUnique({
      where: { id },
      select: { id: true, status: true },
    });
    if (!existing) throw new NotFoundException('Job not found');
    if (!['DRAFT', 'REJECTED'].includes(existing.status)) {
      throw new BadRequestException(
        'Only draft or rejected jobs can be updated',
      );
    }

    assertSalaryRange(dto.salaryMin ?? null, dto.salaryMax ?? null);

    const updated = await this.prisma.job.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.departmentId !== undefined && {
          departmentId: dto.departmentId,
        }),
        ...(dto.positionId !== undefined && { positionId: dto.positionId }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.summary !== undefined && { summary: dto.summary }),
        ...(dto.experienceLevel !== undefined && {
          experienceLevel: dto.experienceLevel,
        }),
        ...(dto.contractType !== undefined && {
          contractType: dto.contractType,
        }),
        ...(dto.employmentType !== undefined && {
          employmentType: dto.employmentType,
        }),
        ...(dto.workLocationType !== undefined && {
          workLocationType: dto.workLocationType,
        }),
        ...(dto.remoteScope !== undefined && { remoteScope: dto.remoteScope }),
        ...(dto.city !== undefined && { city: dto.city }),
        ...(dto.country !== undefined && { country: dto.country }),
        ...(dto.openings !== undefined && { openings: dto.openings }),
        ...(dto.salaryMin !== undefined && { salaryMin: dto.salaryMin }),
        ...(dto.salaryMax !== undefined && { salaryMax: dto.salaryMax }),
        ...(dto.currency !== undefined && { currency: dto.currency }),
        ...(dto.benefits !== undefined && { benefits: dto.benefits }),
        ...(dto.applicationDeadline !== undefined && {
          applicationDeadline: dto.applicationDeadline
            ? new Date(dto.applicationDeadline)
            : null,
        }),
      },
      include: jobInclude,
    });

    return mapJob(updated);
  }
}

@Injectable()
export class SubmitJobUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string) {
    const existing = await this.prisma.job.findUnique({
      where: { id },
      select: { id: true, status: true },
    });
    if (!existing) throw new NotFoundException('Job not found');
    if (!['DRAFT', 'REJECTED'].includes(existing.status)) {
      throw new BadRequestException(
        'Only draft or rejected jobs can be submitted',
      );
    }

    const submitted = await this.prisma.$transaction(async (tx) => {
      await tx.jobApproval.deleteMany({ where: { jobId: id } });
      await tx.jobApproval.createMany({
        data: [
          {
            jobId: id,
            stage: 'FINANCE',
            level: 1,
            requiredRole: SYSTEM_ROLES.FINANCE_MANAGER,
          },
          {
            jobId: id,
            stage: 'GM',
            level: 2,
            requiredRole: SYSTEM_ROLES.SUPERADMIN,
          },
          {
            jobId: id,
            stage: 'HR_REVIEW',
            level: 3,
            requiredRole: SYSTEM_ROLES.HR_MANAGER,
          },
        ],
      });

      return tx.job.update({
        where: { id },
        data: { status: 'PENDING_FINANCE' },
        include: jobInclude,
      });
    });

    return mapJob(submitted);
  }
}

@Injectable()
export class ApproveJobUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, dto: ApproveJobDto, principal: AuthPrincipal) {
    const approverId = principal.userId ?? principal.sub;
    if (!approverId)
      throw new ForbiddenException('Authenticated user id required');

    const existing = await this.prisma.job.findUnique({
      where: { id },
      include: jobInclude,
    });
    if (!existing) throw new NotFoundException('Job not found');

    const stage = currentApprovalStage(existing.status);
    if (!stage) throw new BadRequestException('Job is not awaiting approval');

    const requiredRole = requiredRoleForStage(stage);
    if (!principal.roles?.includes(requiredRole)) {
      throw new ForbiddenException(`Role ${requiredRole} is required`);
    }

    const approval = existing.approvals.find((row) => row.stage === stage);
    if (!approval) throw new BadRequestException('Missing approval stage');
    if (approval.decision !== 'PENDING') {
      throw new ConflictException('Approval already decided');
    }

    const decidedAt = new Date();
    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.jobApproval.update({
        where: { id: approval.id },
        data: {
          approverId,
          decision: dto.decision,
          comments: dto.comments ?? undefined,
          decidedAt,
        },
      });

      if (dto.decision === 'REJECTED') {
        return tx.job.update({
          where: { id },
          data: { status: 'REJECTED' },
          include: jobInclude,
        });
      }

      if (stage === 'FINANCE') {
        return tx.job.update({
          where: { id },
          data: { status: 'PENDING_GM' },
          include: jobInclude,
        });
      }

      if (stage === 'GM') {
        if (existing.creatorIsHr && existing.createdById) {
          const hrApproval = existing.approvals.find(
            (row) => row.stage === 'HR_REVIEW',
          );
          if (!hrApproval)
            throw new BadRequestException('Missing HR approval stage');
          await tx.jobApproval.update({
            where: { id: hrApproval.id },
            data: {
              approverId: existing.createdById,
              decision: 'APPROVED',
              autoApproved: true,
              autoApprovalReason: 'CREATOR_HAS_HR_ROLE',
              comments: 'Auto-approved because creator has HR role',
              decidedAt,
            },
          });
          return tx.job.update({
            where: { id },
            data: { status: 'APPROVED' },
            include: jobInclude,
          });
        }

        return tx.job.update({
          where: { id },
          data: { status: 'PENDING_HR_REVIEW' },
          include: jobInclude,
        });
      }

      return tx.job.update({
        where: { id },
        data: { status: 'APPROVED' },
        include: jobInclude,
      });
    });

    return mapJob(updated);
  }
}

@Injectable()
export class PublishJobUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string) {
    const existing = await this.prisma.job.findUnique({
      where: { id },
      include: jobInclude,
    });
    if (!existing) throw new NotFoundException('Job not found');
    if (existing.status !== 'APPROVED') {
      throw new BadRequestException('Only approved jobs can be published');
    }
    const published = await this.prisma.job.update({
      where: { id },
      data: { status: 'PUBLISHED', publishedAt: new Date() },
      include: jobInclude,
    });
    return mapJob(published);
  }
}

@Injectable()
export class CloseJobUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, dto?: CloseJobDto) {
    const existing = await this.prisma.job.findUnique({
      where: { id },
      include: jobInclude,
    });
    if (!existing) throw new NotFoundException('Job not found');
    if ((dto?.reason?.length ?? 0) > 500) {
      throw new BadRequestException(
        'Close reason must be 500 characters or less',
      );
    }
    if (!['APPROVED', 'PUBLISHED'].includes(existing.status)) {
      throw new BadRequestException('Job cannot be closed from current status');
    }
    const closed = await this.prisma.job.update({
      where: { id },
      data: { status: 'CLOSED' },
      include: jobInclude,
    });
    return mapJob(closed);
  }
}

@Injectable()
export class UpsertJobSkillsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, dto: UpsertJobSkillsDto) {
    await this.prisma.job.findUniqueOrThrow({
      where: { id },
      select: { id: true },
    });
    await this.prisma.$transaction(async (tx) => {
      await tx.jobSkill.deleteMany({ where: { jobId: id } });
      if (dto.skills.length > 0) {
        await tx.jobSkill.createMany({
          data: dto.skills.map((skill) => ({
            jobId: id,
            name: skill.name,
            level: skill.level ?? undefined,
            required: skill.required ?? true,
            order: skill.order ?? undefined,
          })),
        });
      }
    });
    return this.prisma.jobSkill.findMany({
      where: { jobId: id },
      orderBy: { order: 'asc' },
    });
  }
}

@Injectable()
export class UpsertJobToolsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, dto: UpsertJobToolsDto) {
    await this.prisma.job.findUniqueOrThrow({
      where: { id },
      select: { id: true },
    });
    await this.prisma.$transaction(async (tx) => {
      await tx.jobTool.deleteMany({ where: { jobId: id } });
      if (dto.tools.length > 0) {
        await tx.jobTool.createMany({
          data: dto.tools.map((tool) => ({
            jobId: id,
            name: tool.name,
            order: tool.order ?? undefined,
          })),
        });
      }
    });
    return this.prisma.jobTool.findMany({
      where: { jobId: id },
      orderBy: { order: 'asc' },
    });
  }
}

@Injectable()
export class UpsertJobResponsibilitiesUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, dto: UpsertJobResponsibilitiesDto) {
    await this.prisma.job.findUniqueOrThrow({
      where: { id },
      select: { id: true },
    });
    await this.prisma.$transaction(async (tx) => {
      await tx.jobResponsibility.deleteMany({ where: { jobId: id } });
      if (dto.responsibilities.length > 0) {
        await tx.jobResponsibility.createMany({
          data: dto.responsibilities.map((responsibility) => ({
            jobId: id,
            description: responsibility.description,
            order: responsibility.order ?? undefined,
          })),
        });
      }
    });
    return this.prisma.jobResponsibility.findMany({
      where: { jobId: id },
      orderBy: { order: 'asc' },
    });
  }
}
