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
  assertDepartmentPositionIntegrity,
  assertSalaryRange,
  assertSubmitReadiness,
  computeJobStatusFromApprovals,
  generateUniqueSlug,
  isApprovalStageActionable,
  jobInclude,
  mapJob,
  requiredRoleForStage,
} from './recruitment.usecase-helpers';

type ApprovalStage = 'FINANCE' | 'GM' | 'HR_REVIEW';

interface ApprovalState {
  id: string;
  stage: ApprovalStage;
  decision: 'PENDING' | 'APPROVED' | 'REJECTED';
}

const toNumberOrNull = (value: unknown): number | null => {
  if (value == null) return null;
  return Number(value);
};

const toApprovalState = (approval: {
  id: string;
  stage: string;
  decision: string;
}): ApprovalState => ({
  id: approval.id,
  stage: approval.stage as ApprovalStage,
  decision: approval.decision as ApprovalState['decision'],
});

@Injectable()
export class CreateJobUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateJobDto, principal: AuthPrincipal) {
    await assertDepartmentPositionIntegrity(
      this.prisma,
      dto.departmentId!,
      dto.positionId!,
    );
    assertSalaryRange(dto.salaryMin!, dto.salaryMax!);

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
        departmentId: dto.departmentId,
        positionId: dto.positionId,
        description: dto.description,
        summary: dto.summary ?? undefined,
        experienceLevel: dto.experienceLevel,
        contractType: dto.contractType,
        employmentType: dto.employmentType ?? undefined,
        workLocationType: dto.workLocationType,
        remoteScope: dto.remoteScope ?? undefined,
        city: dto.city ?? undefined,
        country: dto.country ?? undefined,
        openings: dto.openings,
        salaryMin: dto.salaryMin,
        salaryMax: dto.salaryMax,
        currency: dto.currency,
        benefits: dto.benefits ?? [],
        creatorIsHr,
        applicationDeadline: new Date(dto.applicationDeadline!),
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
      select: {
        id: true,
        status: true,
        departmentId: true,
        positionId: true,
        salaryMin: true,
        salaryMax: true,
      },
    });
    if (!existing) throw new NotFoundException('Job not found');
    if (!['DRAFT', 'REJECTED'].includes(existing.status)) {
      throw new BadRequestException(
        'Only draft or rejected jobs can be updated',
      );
    }

    const nextDepartmentId = dto.departmentId ?? existing.departmentId;
    const nextPositionId = dto.positionId ?? existing.positionId;
    if (!nextDepartmentId || !nextPositionId) {
      throw new BadRequestException(
        'departmentId and positionId are required for job updates',
      );
    }
    await assertDepartmentPositionIntegrity(
      this.prisma,
      nextDepartmentId,
      nextPositionId,
    );

    const nextSalaryMin =
      dto.salaryMin !== undefined
        ? dto.salaryMin
        : toNumberOrNull(existing.salaryMin);
    const nextSalaryMax =
      dto.salaryMax !== undefined
        ? dto.salaryMax
        : toNumberOrNull(existing.salaryMax);
    assertSalaryRange(nextSalaryMin, nextSalaryMax);

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
          applicationDeadline: new Date(dto.applicationDeadline!),
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
      include: {
        skills: { select: { id: true } },
        responsibilities: { select: { id: true } },
      },
    });
    if (!existing) throw new NotFoundException('Job not found');
    if (!['DRAFT', 'REJECTED'].includes(existing.status)) {
      throw new BadRequestException(
        'Only draft or rejected jobs can be submitted',
      );
    }
    if (!existing.departmentId || !existing.positionId) {
      throw new BadRequestException(
        'departmentId and positionId are required before submit',
      );
    }

    await assertDepartmentPositionIntegrity(
      this.prisma,
      existing.departmentId,
      existing.positionId,
    );
    assertSubmitReadiness({
      title: existing.title,
      description: existing.description,
      departmentId: existing.departmentId,
      positionId: existing.positionId,
      experienceLevel: existing.experienceLevel,
      contractType: existing.contractType,
      workLocationType: existing.workLocationType,
      openings: existing.openings,
      salaryMin: toNumberOrNull(existing.salaryMin),
      salaryMax: toNumberOrNull(existing.salaryMax),
      currency: existing.currency,
      applicationDeadline: existing.applicationDeadline,
      skills: existing.skills,
      responsibilities: existing.responsibilities,
    });

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
    if (!approverId) {
      throw new ForbiddenException('Authenticated user id required');
    }

    const existing = await this.prisma.job.findUnique({
      where: { id },
      include: jobInclude,
    });
    if (!existing) throw new NotFoundException('Job not found');

    const approvals = existing.approvals.map(toApprovalState);
    if (approvals.length === 0) {
      throw new BadRequestException('Missing approval stage configuration');
    }

    const pendingActionable = approvals.filter(
      (approval) =>
        approval.decision === 'PENDING' &&
        isApprovalStageActionable(approval.stage, approvals),
    );

    let target = pendingActionable[0];
    if (dto.stage !== undefined) {
      const stageApproval = approvals.find(
        (approval) => approval.stage === dto.stage,
      );
      if (!stageApproval) {
        throw new BadRequestException('Invalid approval stage');
      }
      if (stageApproval.decision !== 'PENDING') {
        throw new ConflictException('Approval already decided');
      }
      if (!isApprovalStageActionable(dto.stage!, approvals)) {
        throw new BadRequestException('Approval stage is not actionable');
      }
      target = stageApproval;
    }

    if (!target) {
      throw new BadRequestException('No pending approval stage available');
    }

    const requiredRole = requiredRoleForStage(target.stage);
    if (!principal.roles?.includes(requiredRole)) {
      throw new ForbiddenException(`Role ${requiredRole} is required`);
    }

    if (!dto.stage) {
      const eligibleStages = pendingActionable.filter((approval) =>
        principal.roles?.includes(requiredRoleForStage(approval.stage)),
      );
      if (eligibleStages.length === 0) {
        throw new ForbiddenException('Required approval role is missing');
      }
      if (eligibleStages.length > 1) {
        throw new BadRequestException(
          'Multiple approval stages are available; specify stage',
        );
      }
      target = eligibleStages[0];
    }

    const decidedAt = new Date();
    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.jobApproval.update({
        where: { id: target.id },
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

      const nextApprovals: ApprovalState[] = approvals.map((approval) =>
        approval.id === target.id
          ? { ...approval, decision: 'APPROVED' }
          : approval,
      );

      const finance = nextApprovals.find(
        (approval) => approval.stage === 'FINANCE',
      );
      const gm = nextApprovals.find((approval) => approval.stage === 'GM');
      const hr = nextApprovals.find(
        (approval) => approval.stage === 'HR_REVIEW',
      );

      if (!finance || !gm || !hr) {
        throw new BadRequestException('Missing approval stage configuration');
      }

      if (
        existing.creatorIsHr &&
        existing.createdById &&
        finance.decision === 'APPROVED' &&
        gm.decision === 'APPROVED' &&
        hr.decision === 'PENDING'
      ) {
        await tx.jobApproval.update({
          where: { id: hr.id },
          data: {
            approverId: existing.createdById,
            decision: 'APPROVED',
            autoApproved: true,
            autoApprovalReason: 'CREATOR_HAS_HR_ROLE',
            comments: 'Auto-approved because creator has HR role',
            decidedAt,
          },
        });
        hr.decision = 'APPROVED';
      }

      const nextStatus = computeJobStatusFromApprovals(nextApprovals);
      return tx.job.update({
        where: { id },
        data: { status: nextStatus },
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
