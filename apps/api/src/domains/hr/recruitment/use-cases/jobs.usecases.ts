import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../../../platform/prisma/prisma-client';
import { SYSTEM_ROLES } from '../../../../shared/constants/system-roles.constant';
import type { AuthPrincipal } from '../../../../shared/interfaces/auth-principal.interface';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import type {
  ApproveJobDto,
  CloseJobDto,
  CreateJobDto,
  JobApplicationCustomFieldInputDto,
  JobApplicationFormFieldInputDto,
  JobApplicationFormSectionInputDto,
  JobListQueryDto,
  UpdateJobDto,
  UpsertJobResponsibilitiesDto,
  UpsertJobSkillsDto,
  UpsertJobToolsDto,
} from '../dto/job.dto';
import {
  approvalDecisionToStageStatus,
  assertDepartmentPositionIntegrity,
  assertSalaryRange,
  assertSubmitReadiness,
  computeJobStatusFromApprovals,
  generateUniqueSlug,
  isApprovalStageActionable,
  jobInclude,
  mapJob,
  normalizeSkillArray,
  normalizeStringArray,
  requiredRoleForStage,
} from './recruitment.usecase-helpers';

type ApprovalStage = 'FINANCE' | 'GM' | 'HR_REVIEW';
type StageStatus = 'PENDING_FOR_APPROVAL' | 'APPROVED' | 'REJECTED';

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

const stageFieldPatch = (stage: ApprovalStage, value: StageStatus) => {
  if (stage === 'FINANCE') return { financeApprovalStatus: value };
  if (stage === 'GM') return { gmApprovalStatus: value };
  return { hrApprovalStatus: value };
};

const buildStageStatusesFromApprovals = (approvals: ApprovalState[]) => {
  const finance = approvals.find((approval) => approval.stage === 'FINANCE');
  const gm = approvals.find((approval) => approval.stage === 'GM');
  const hr = approvals.find((approval) => approval.stage === 'HR_REVIEW');
  if (!finance || !gm || !hr) {
    throw new BadRequestException('Missing approval stage configuration');
  }
  return {
    financeApprovalStatus: approvalDecisionToStageStatus(finance.decision),
    gmApprovalStatus: approvalDecisionToStageStatus(gm.decision),
    hrApprovalStatus: approvalDecisionToStageStatus(hr.decision),
  };
};

const validateApplicationCustomFieldOptions = (
  customFields: JobApplicationCustomFieldInputDto[],
) => {
  const seenIds = new Set<string>();
  for (const field of customFields) {
    if (seenIds.has(field.id)) {
      throw new BadRequestException(
        `Duplicate custom field id detected: ${field.id}`,
      );
    }
    seenIds.add(field.id);
    const options = field.options ?? [];
    const needsOptions = field.type === 'SELECT' || field.type === 'CHECKBOX';
    if (needsOptions && options.length === 0) {
      throw new BadRequestException(
        `custom field ${field.id} must include at least one option`,
      );
    }
    if (!needsOptions && options.length > 0) {
      throw new BadRequestException(
        `custom field ${field.id} options are allowed only for SELECT or CHECKBOX types`,
      );
    }
  }
};

const validateApplicantFieldConfig = (
  applicantFields: JobApplicationFormFieldInputDto[],
) => {
  const seenKeys = new Set<string>();
  for (const field of applicantFields) {
    if (seenKeys.has(field.key)) {
      throw new BadRequestException(
        `Duplicate applicant field key detected: ${field.key}`,
      );
    }
    seenKeys.add(field.key);

    if (field.required && !field.enabled) {
      throw new BadRequestException(
        `Applicant field ${field.key} cannot be required when disabled`,
      );
    }
  }
};

const validateFormSectionConfig = (
  sections: JobApplicationFormSectionInputDto[],
) => {
  const seenKeys = new Set<string>();
  for (const section of sections) {
    if (seenKeys.has(section.key)) {
      throw new BadRequestException(
        `Duplicate application section key detected: ${section.key}`,
      );
    }
    seenKeys.add(section.key);

    if (section.required && !section.enabled) {
      throw new BadRequestException(
        `Application section ${section.key} cannot be required when disabled`,
      );
    }
  }
};

const currencyOrNull = (value: string | null | undefined) =>
  value?.trim() ? value.trim().toUpperCase() : null;

const defaultApplicantFields = (): JobApplicationFormFieldInputDto[] => [
  { key: 'PHONE', enabled: true, required: false, order: 1 },
  { key: 'LINKEDIN_URL', enabled: false, required: false, order: 2 },
  { key: 'PORTFOLIO_URL', enabled: false, required: false, order: 3 },
  { key: 'GITHUB_URL', enabled: false, required: false, order: 4 },
  { key: 'EXPECTED_SALARY', enabled: false, required: false, order: 5 },
  { key: 'COVER_LETTER', enabled: false, required: false, order: 6 },
];

const defaultFormSections = (): JobApplicationFormSectionInputDto[] => [
  { key: 'EDUCATION', enabled: false, required: false, order: 1 },
  { key: 'EXPERIENCE', enabled: false, required: false, order: 2 },
];

const assertOptionalUserExists = async (
  prisma: PrismaService,
  userId: string | null | undefined,
  field: string,
) => {
  if (!userId) return;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (!user) {
    throw new BadRequestException(
      `${field} does not reference an existing user`,
    );
  }
};

const mapExistingJobToDtoShape = (job: any): CreateJobDto => {
  const requestForm = job.requestForm;
  const applicationForm = job.applicationForm;

  return {
    requestForm: {
      jobTitle: requestForm?.jobTitle ?? job.title,
      department: requestForm?.departmentId ?? job.departmentId,
      requestedBy: requestForm?.requestedBy ?? 'System',
      position: requestForm?.positionId ?? job.positionId,
      requestType: requestForm?.requestType ?? 'NEW',
      replaceForUserId: requestForm?.replaceForUserId ?? undefined,
      businessJustification:
        requestForm?.businessJustification ?? 'Auto-generated request form',
      employmentType:
        requestForm?.employmentType ?? job.employmentType ?? 'FULL_TIME',
      workMode: requestForm?.workMode ?? job.workLocationType,
      urgency: requestForm?.urgency ?? 'MEDIUM',
      neededByDate: (requestForm?.neededByDate ?? new Date()).toISOString(),
    },
    job: {
      title: job.title,
      departmentId: job.departmentId,
      positionId: job.positionId,
      description: job.description,
      summary: job.summary ?? undefined,
      experienceLevel: job.experienceLevel ?? undefined,
      contractType: job.contractType,
      employmentType: job.employmentType ?? undefined,
      workLocationType: job.workLocationType,
      remoteScope: job.remoteScope ?? undefined,
      city: job.city ?? undefined,
      country: job.country ?? undefined,
      openings: job.openings,
      salaryMin: toNumberOrNull(job.salaryMin) ?? undefined,
      salaryMax: toNumberOrNull(job.salaryMax) ?? undefined,
      currency: job.currency ?? undefined,
      salaryMode: job.salaryMode,
      benefits: job.benefits ?? [],
      requiredSkills: job.requiredSkills ?? [],
      preferredSkills: job.preferredSkills ?? [],
      responsibilities: job.responsibilities ?? [],
      tools: job.tools ?? [],
      priority: job.priority ?? undefined,
      hiringManagerId: job.hiringManagerId ?? undefined,
      applicationDeadline: job.applicationDeadline
        ? job.applicationDeadline.toISOString()
        : undefined,
    },
    applicationForm: {
      applicantFields:
        applicationForm?.applicantFields?.length > 0
          ? applicationForm.applicantFields.map(
              (field: any, index: number) => ({
                key: field.key,
                enabled: field.enabled,
                required: field.required,
                order: field.order ?? index + 1,
              }),
            )
          : defaultApplicantFields(),
      sections:
        applicationForm?.sections?.length > 0
          ? applicationForm.sections.map((section: any, index: number) => ({
              key: section.key,
              enabled: section.enabled,
              required: section.required,
              order: section.order ?? index + 1,
            }))
          : defaultFormSections(),
      customFields: (applicationForm?.customFields ?? []).map((field: any) => ({
        id: field.customFieldId,
        label: field.label,
        type: field.type,
        required: field.required,
        helpText: field.helpText ?? undefined,
        options: (field.options ?? []).map((option: any) => option.value),
      })),
    },
  };
};

const mergeNestedPayload = (
  existing: CreateJobDto,
  incoming: UpdateJobDto,
) => ({
  requestForm: {
    ...existing.requestForm,
    ...(incoming.requestForm ?? {}),
  },
  job: {
    ...existing.job,
    ...(incoming.job ?? {}),
    benefits: incoming.job?.benefits ?? existing.job.benefits,
    requiredSkills: incoming.job?.requiredSkills ?? existing.job.requiredSkills,
    preferredSkills:
      incoming.job?.preferredSkills ?? existing.job.preferredSkills,
    responsibilities:
      incoming.job?.responsibilities ?? existing.job.responsibilities,
    tools: incoming.job?.tools ?? existing.job.tools,
  },
  applicationForm: {
    ...existing.applicationForm,
    ...(incoming.applicationForm ?? {}),
    applicantFields:
      incoming.applicationForm?.applicantFields ??
      existing.applicationForm.applicantFields,
    sections:
      incoming.applicationForm?.sections ?? existing.applicationForm.sections,
    customFields:
      incoming.applicationForm?.customFields ??
      existing.applicationForm.customFields,
  },
});

@Injectable()
export class CreateJobUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateJobDto, principal: AuthPrincipal) {
    validateApplicationCustomFieldOptions(dto.applicationForm.customFields);
    validateApplicantFieldConfig(dto.applicationForm.applicantFields);
    validateFormSectionConfig(dto.applicationForm.sections);

    await assertDepartmentPositionIntegrity(
      this.prisma,
      dto.requestForm.department,
      dto.requestForm.position,
    );
    await assertDepartmentPositionIntegrity(
      this.prisma,
      dto.job.departmentId,
      dto.job.positionId,
    );
    await assertOptionalUserExists(
      this.prisma,
      dto.job.hiringManagerId,
      'job.hiringManagerId',
    );
    await assertOptionalUserExists(
      this.prisma,
      dto.requestForm.replaceForUserId,
      'requestForm.replaceForUserId',
    );
    assertSalaryRange(dto.job.salaryMin ?? null, dto.job.salaryMax ?? null);

    const slug = await generateUniqueSlug(this.prisma, dto.job.title);
    const creatorId = principal.userId ?? principal.sub;
    const creatorIsHr =
      principal.roles?.includes(SYSTEM_ROLES.HR) ||
      principal.roles?.includes(SYSTEM_ROLES.HR_MANAGER) ||
      false;
    const jobRequiredSkills = normalizeSkillArray(dto.job.requiredSkills ?? []);
    const jobPreferredSkills = normalizeSkillArray(
      dto.job.preferredSkills ?? [],
    );
    const jobResponsibilities = normalizeStringArray(
      dto.job.responsibilities ?? [],
    );
    const jobTools = normalizeStringArray(dto.job.tools ?? []);
    const applicantFields = dto.applicationForm.applicantFields.map(
      (field, index) => ({
        key: field.key,
        enabled: field.enabled,
        required: field.required,
        order: field.order ?? index + 1,
      }),
    );
    const sections = dto.applicationForm.sections.map((section, index) => ({
      key: section.key,
      enabled: section.enabled,
      required: section.required,
      order: section.order ?? index + 1,
    }));

    const created = await this.prisma.job.create({
      data: {
        title: dto.job.title,
        slug,
        departmentId: dto.job.departmentId,
        positionId: dto.job.positionId,
        description: dto.job.description as Prisma.InputJsonValue,
        summary: (dto.job.summary as Prisma.InputJsonValue | null) ?? undefined,
        experienceLevel: dto.job.experienceLevel ?? undefined,
        contractType: dto.job.contractType,
        employmentType: dto.job.employmentType ?? undefined,
        workLocationType: dto.job.workLocationType,
        remoteScope: dto.job.remoteScope ?? undefined,
        city: dto.job.city ?? undefined,
        country: dto.job.country ?? undefined,
        openings: dto.job.openings ?? 1,
        salaryMin: dto.job.salaryMin ?? undefined,
        salaryMax: dto.job.salaryMax ?? undefined,
        currency: currencyOrNull(dto.job.currency) ?? undefined,
        salaryMode: dto.job.salaryMode ?? 'NOT_SPECIFIED',
        benefits: dto.job.benefits ?? [],
        requiredSkills: jobRequiredSkills,
        preferredSkills: jobPreferredSkills,
        responsibilities: jobResponsibilities,
        tools: jobTools,
        creatorIsHr,
        priority: dto.job.priority ?? 'MEDIUM',
        hiringManagerId: dto.job.hiringManagerId ?? undefined,
        applicationDeadline: dto.job.applicationDeadline
          ? new Date(dto.job.applicationDeadline)
          : undefined,
        draftedAt: new Date(),
        createdById: creatorId,
        financeApprovalStatus: 'PENDING_FOR_APPROVAL',
        gmApprovalStatus: 'PENDING_FOR_APPROVAL',
        hrApprovalStatus: 'PENDING_FOR_APPROVAL',
        requestForm: {
          create: {
            jobTitle: dto.requestForm.jobTitle,
            departmentId: dto.requestForm.department,
            requestedBy: dto.requestForm.requestedBy,
            positionId: dto.requestForm.position,
            requestType: dto.requestForm.requestType,
            replaceForUserId: dto.requestForm.replaceForUserId ?? undefined,
            businessJustification: dto.requestForm.businessJustification,
            employmentType: dto.requestForm.employmentType,
            workMode: dto.requestForm.workMode,
            urgency: dto.requestForm.urgency,
            neededByDate: new Date(dto.requestForm.neededByDate),
          },
        },
        applicationForm: {
          create: {
            applicantFields: {
              create: applicantFields.map((field) => ({
                key: field.key,
                enabled: field.enabled,
                required: field.required,
                order: field.order,
              })),
            },
            sections: {
              create: sections.map((section) => ({
                key: section.key,
                enabled: section.enabled,
                required: section.required,
                order: section.order,
              })),
            },
            customFields: {
              create: dto.applicationForm.customFields.map((field, index) => ({
                customFieldId: field.id,
                label: field.label,
                type: field.type,
                required: field.required,
                helpText: field.helpText ?? undefined,
                order: index + 1,
                options: {
                  create: (field.options ?? []).map((option, optionIndex) => ({
                    value: option,
                    order: optionIndex + 1,
                  })),
                },
              })),
            },
          },
        },
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
        ...(query.financeApprovalStatus
          ? { financeApprovalStatus: query.financeApprovalStatus }
          : {}),
        ...(query.gmApprovalStatus
          ? { gmApprovalStatus: query.gmApprovalStatus }
          : {}),
        ...(query.hrApprovalStatus
          ? { hrApprovalStatus: query.hrApprovalStatus }
          : {}),
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
    const job = await this.prisma.job
      .update({
        where: { id },
        data: { viewsCount: { increment: 1 } },
        include: jobInclude,
      })
      .catch((error: unknown) => {
        if (
          typeof error === 'object' &&
          error !== null &&
          'code' in error &&
          (error as { code?: string }).code === 'P2025'
        ) {
          throw new NotFoundException('Job not found');
        }
        throw error;
      });
    return mapJob(job);
  }
}

@Injectable()
export class UpdateJobUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, dto: UpdateJobDto) {
    const existing = await this.prisma.job.findUnique({
      where: { id },
      include: jobInclude,
    });
    if (!existing) throw new NotFoundException('Job not found');
    if (!['DRAFT', 'REJECTED'].includes(existing.status)) {
      throw new BadRequestException(
        'Only draft or rejected jobs can be updated',
      );
    }

    const merged = mergeNestedPayload(mapExistingJobToDtoShape(existing), dto);
    validateApplicationCustomFieldOptions(merged.applicationForm.customFields);
    validateApplicantFieldConfig(merged.applicationForm.applicantFields);
    validateFormSectionConfig(merged.applicationForm.sections);

    await assertDepartmentPositionIntegrity(
      this.prisma,
      merged.requestForm.department,
      merged.requestForm.position,
    );
    await assertDepartmentPositionIntegrity(
      this.prisma,
      merged.job.departmentId,
      merged.job.positionId,
    );
    await assertOptionalUserExists(
      this.prisma,
      merged.job.hiringManagerId,
      'job.hiringManagerId',
    );
    await assertOptionalUserExists(
      this.prisma,
      merged.requestForm.replaceForUserId,
      'requestForm.replaceForUserId',
    );
    assertSalaryRange(
      merged.job.salaryMin ?? null,
      merged.job.salaryMax ?? null,
    );

    const requiredSkills = normalizeSkillArray(merged.job.requiredSkills);
    const preferredSkills = normalizeSkillArray(merged.job.preferredSkills);
    const responsibilities = normalizeStringArray(merged.job.responsibilities);
    const tools = normalizeStringArray(merged.job.tools);
    const applicantFields = merged.applicationForm.applicantFields.map(
      (field, index) => ({
        key: field.key,
        enabled: field.enabled,
        required: field.required,
        order: field.order ?? index + 1,
      }),
    );
    const sections = merged.applicationForm.sections.map((section, index) => ({
      key: section.key,
      enabled: section.enabled,
      required: section.required,
      order: section.order ?? index + 1,
    }));

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.job.update({
        where: { id },
        data: {
          title: merged.job.title,
          departmentId: merged.job.departmentId,
          positionId: merged.job.positionId,
          description: merged.job.description as Prisma.InputJsonValue,
          summary:
            (merged.job.summary as Prisma.InputJsonValue | null) ??
            Prisma.DbNull,
          experienceLevel: merged.job.experienceLevel,
          contractType: merged.job.contractType,
          employmentType: merged.job.employmentType ?? null,
          workLocationType: merged.job.workLocationType,
          remoteScope: merged.job.remoteScope ?? null,
          city: merged.job.city ?? null,
          country: merged.job.country ?? null,
          openings: merged.job.openings,
          salaryMin: merged.job.salaryMin ?? null,
          salaryMax: merged.job.salaryMax ?? null,
          currency: currencyOrNull(merged.job.currency),
          salaryMode: merged.job.salaryMode ?? 'NOT_SPECIFIED',
          benefits: merged.job.benefits ?? [],
          requiredSkills,
          preferredSkills,
          responsibilities,
          tools,
          applicationDeadline: merged.job.applicationDeadline
            ? new Date(merged.job.applicationDeadline)
            : null,
          ...(dto.job?.priority !== undefined && {
            priority: dto.job.priority,
          }),
          ...(dto.job?.hiringManagerId !== undefined && {
            hiringManagerId: dto.job.hiringManagerId,
          }),
        },
      });

      await tx.jobRequestForm.upsert({
        where: { jobId: id },
        create: {
          jobId: id,
          jobTitle: merged.requestForm.jobTitle,
          departmentId: merged.requestForm.department,
          requestedBy: merged.requestForm.requestedBy,
          positionId: merged.requestForm.position,
          requestType: merged.requestForm.requestType,
          replaceForUserId: merged.requestForm.replaceForUserId ?? undefined,
          businessJustification: merged.requestForm.businessJustification,
          employmentType: merged.requestForm.employmentType,
          workMode: merged.requestForm.workMode,
          urgency: merged.requestForm.urgency,
          neededByDate: new Date(merged.requestForm.neededByDate),
        },
        update: {
          jobTitle: merged.requestForm.jobTitle,
          departmentId: merged.requestForm.department,
          requestedBy: merged.requestForm.requestedBy,
          positionId: merged.requestForm.position,
          requestType: merged.requestForm.requestType,
          replaceForUserId: merged.requestForm.replaceForUserId ?? null,
          businessJustification: merged.requestForm.businessJustification,
          employmentType: merged.requestForm.employmentType,
          workMode: merged.requestForm.workMode,
          urgency: merged.requestForm.urgency,
          neededByDate: new Date(merged.requestForm.neededByDate),
        },
      });

      const applicationForm = await tx.jobApplicationForm.upsert({
        where: { jobId: id },
        create: {
          jobId: id,
        },
        update: {
          updatedAt: new Date(),
        },
        select: { id: true },
      });

      await tx.jobApplicationFormField.deleteMany({
        where: { jobApplicationFormId: applicationForm.id },
      });
      if (applicantFields.length > 0) {
        await tx.jobApplicationFormField.createMany({
          data: applicantFields.map((field) => ({
            jobApplicationFormId: applicationForm.id,
            key: field.key,
            enabled: field.enabled,
            required: field.required,
            order: field.order,
          })),
        });
      }

      await tx.jobApplicationFormSection.deleteMany({
        where: { jobApplicationFormId: applicationForm.id },
      });
      if (sections.length > 0) {
        await tx.jobApplicationFormSection.createMany({
          data: sections.map((section) => ({
            jobApplicationFormId: applicationForm.id,
            key: section.key,
            enabled: section.enabled,
            required: section.required,
            order: section.order,
          })),
        });
      }

      await tx.jobApplicationCustomField.deleteMany({
        where: { jobApplicationFormId: applicationForm.id },
      });
      for (let i = 0; i < merged.applicationForm.customFields.length; i += 1) {
        const field = merged.applicationForm.customFields[i];
        await tx.jobApplicationCustomField.create({
          data: {
            jobApplicationFormId: applicationForm.id,
            customFieldId: field.id,
            label: field.label,
            type: field.type,
            required: field.required,
            helpText: field.helpText ?? undefined,
            order: i + 1,
            options: {
              create: (field.options ?? []).map((option, optionIndex) => ({
                value: option,
                order: optionIndex + 1,
              })),
            },
          },
        });
      }

      return tx.job.findUniqueOrThrow({
        where: { id },
        include: jobInclude,
      });
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
      select: {
        id: true,
        status: true,
        title: true,
        description: true,
        departmentId: true,
        positionId: true,
        experienceLevel: true,
        contractType: true,
        workLocationType: true,
        openings: true,
        salaryMin: true,
        salaryMax: true,
        currency: true,
        applicationDeadline: true,
        requiredSkills: true,
        responsibilities: true,
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
      requiredSkills: existing.requiredSkills,
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

      const now = new Date();
      return tx.job.update({
        where: { id },
        data: {
          status: 'PENDING_FOR_APPROVAL',
          financeApprovalStatus: 'PENDING_FOR_APPROVAL',
          gmApprovalStatus: 'PENDING_FOR_APPROVAL',
          hrApprovalStatus: 'PENDING_FOR_APPROVAL',
          pendingApprovalAt: now,
        },
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
          data: {
            ...stageFieldPatch(target.stage, 'REJECTED'),
            status: 'REJECTED',
            rejectedAt: decidedAt,
          },
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
      const stageStatuses = buildStageStatusesFromApprovals(nextApprovals);
      return tx.job.update({
        where: { id },
        data: {
          ...stageStatuses,
          status: nextStatus,
          ...(nextStatus === 'READY_TO_POST'
            ? { readyToPostAt: decidedAt }
            : {}),
        },
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
    if (existing.status !== 'READY_TO_POST') {
      throw new BadRequestException('Only ready-to-post jobs can be published');
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
    if (!['READY_TO_POST', 'PUBLISHED'].includes(existing.status)) {
      throw new BadRequestException('Job cannot be closed from current status');
    }
    const closed = await this.prisma.job.update({
      where: { id },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
        closingReason: dto?.reason ?? null,
      },
      include: jobInclude,
    });
    return mapJob(closed);
  }
}

@Injectable()
export class UpsertJobSkillsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, dto: UpsertJobSkillsDto) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      select: { preferredSkills: true },
    });
    if (!job) throw new NotFoundException('Job not found');

    const requiredSkills = normalizeSkillArray(dto.requiredSkills);
    const preferredSkills =
      dto.preferredSkills === undefined
        ? (job.preferredSkills ?? [])
        : normalizeSkillArray(dto.preferredSkills);
    await this.prisma.job.update({
      where: { id },
      data: {
        requiredSkills,
        preferredSkills,
      },
    });

    return { requiredSkills, preferredSkills };
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

    const tools = normalizeStringArray(dto.tools);
    await this.prisma.job.update({
      where: { id },
      data: { tools },
    });

    return { tools };
  }
}

@Injectable()
export class UpsertJobResponsibilitiesUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, dto: UpsertJobResponsibilitiesDto) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!job) throw new NotFoundException('Job not found');

    const responsibilities = normalizeStringArray(dto.responsibilities);
    await this.prisma.job.update({
      where: { id },
      data: { responsibilities },
    });

    return responsibilities;
  }
}
