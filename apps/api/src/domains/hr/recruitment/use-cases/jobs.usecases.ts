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
  JobDetailsFormInputDto,
  JobListQueryDto,
  JobRequestFormInputDto,
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
  normalizeStringArray,
  requiredRoleForStage,
} from './recruitment.usecase-helpers';

type ApprovalStage = 'FINANCE' | 'GM' | 'HR_REVIEW';
type StageStatus = 'PENDING_FOR_APPROVAL' | 'APPROVED' | 'REJECTED';
type EmploymentType =
  | 'FULL_TIME'
  | 'PART_TIME'
  | 'CONTRACT'
  | 'INTERN'
  | 'TEMPORARY';

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

const EMPLOYMENT_TO_CONTRACT: Record<
  EmploymentType,
  'PERMANENT' | 'CONTRACT' | 'INTERNSHIP' | 'FREELANCE'
> = {
  FULL_TIME: 'PERMANENT',
  PART_TIME: 'PERMANENT',
  CONTRACT: 'CONTRACT',
  INTERN: 'INTERNSHIP',
  TEMPORARY: 'CONTRACT',
};

const parseLocation = (
  location: string,
): { city: string | null; country: string | null } => {
  const parts = location
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length === 0) return { city: null, country: null };
  if (parts.length === 1) return { city: parts[0], country: null };
  return { city: parts[0], country: parts[parts.length - 1] };
};

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

const validateFormConsistency = (
  requestForm: JobRequestFormInputDto,
  jobDetailsForm: JobDetailsFormInputDto,
) => {
  if (requestForm.jobTitle !== jobDetailsForm.jobTitle) {
    throw new BadRequestException(
      'requestForm.jobTitle must match jobDetailsForm.jobTitle',
    );
  }
  if (requestForm.workMode !== jobDetailsForm.workMode) {
    throw new BadRequestException(
      'requestForm.workMode must match jobDetailsForm.workMode',
    );
  }
  if (requestForm.employmentType !== jobDetailsForm.employmentType) {
    throw new BadRequestException(
      'requestForm.employmentType must match jobDetailsForm.employmentType',
    );
  }
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

const validatePredefinedFieldKeys = (
  predefinedFields: Array<{ key: string }>,
) => {
  const seen = new Set<string>();
  for (const field of predefinedFields) {
    if (seen.has(field.key)) {
      throw new BadRequestException(
        `Duplicate predefined field key detected: ${field.key}`,
      );
    }
    seen.add(field.key);
  }
};

const currencyOrNull = (value: string | null | undefined) =>
  value?.trim() ? value.trim().toUpperCase() : null;

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
  if (!job.requestForm?.detailsForm?.applicationForm) {
    throw new BadRequestException(
      'Job is missing form records required for nested updates',
    );
  }

  return {
    requestForm: {
      jobTitle: job.requestForm.jobTitle,
      department: job.requestForm.departmentId,
      requestedBy: job.requestForm.requestedBy,
      position: job.requestForm.positionId,
      requestType: job.requestForm.requestType,
      replaceForUserId: job.requestForm.replaceForUserId ?? undefined,
      businessJustification: job.requestForm.businessJustification,
      employmentType: job.requestForm.employmentType,
      workMode: job.requestForm.workMode,
      urgency: job.requestForm.urgency,
      neededByDate: job.requestForm.neededByDate.toISOString(),
    },
    jobDetailsForm: {
      jobTitle: job.requestForm.detailsForm.jobTitle,
      location: job.requestForm.detailsForm.location,
      workMode: job.requestForm.detailsForm.workMode,
      employmentType: job.requestForm.detailsForm.employmentType,
      jobSummary: job.requestForm.detailsForm.jobSummary,
      whyJoinUs: job.requestForm.detailsForm.whyJoinUs ?? undefined,
      skills: job.requestForm.detailsForm.skills ?? [],
      responsibilities: job.requestForm.detailsForm.responsibilities ?? [],
      preferredSkills: job.requestForm.detailsForm.preferredSkills ?? undefined,
      experienceLevel: job.requestForm.detailsForm.experienceLevel,
      salaryMin:
        toNumberOrNull(job.requestForm.detailsForm.salaryMin) ?? undefined,
      salaryMax:
        toNumberOrNull(job.requestForm.detailsForm.salaryMax) ?? undefined,
      salaryCurrency: job.requestForm.detailsForm.salaryCurrency ?? undefined,
      salaryMode: job.requestForm.detailsForm.salaryMode,
      benefits: job.requestForm.detailsForm.benefits ?? [],
      openings: job.requestForm.detailsForm.openings,
      applicationDeadline:
        job.requestForm.detailsForm.applicationDeadline.toISOString(),
    },
    applicationForm: {
      predefinedFields: (
        job.requestForm.detailsForm.applicationForm.predefinedFields ?? []
      ).map((field: any) => ({
        key: field.key,
        enabled: field.enabled,
        required: field.required,
      })),
      customFields: (
        job.requestForm.detailsForm.applicationForm.customFields ?? []
      ).map((field: any) => ({
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
  jobDetailsForm: {
    ...existing.jobDetailsForm,
    ...(incoming.jobDetailsForm ?? {}),
    skills: incoming.jobDetailsForm?.skills ?? existing.jobDetailsForm.skills,
    responsibilities:
      incoming.jobDetailsForm?.responsibilities ??
      existing.jobDetailsForm.responsibilities,
  },
  applicationForm: {
    ...existing.applicationForm,
    ...(incoming.applicationForm ?? {}),
    predefinedFields:
      incoming.applicationForm?.predefinedFields ??
      existing.applicationForm.predefinedFields,
    customFields:
      incoming.applicationForm?.customFields ??
      existing.applicationForm.customFields,
  },
});

@Injectable()
export class CreateJobUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateJobDto, principal: AuthPrincipal) {
    validateFormConsistency(dto.requestForm, dto.jobDetailsForm);
    validateApplicationCustomFieldOptions(dto.applicationForm.customFields);
    validatePredefinedFieldKeys(dto.applicationForm.predefinedFields);

    await assertDepartmentPositionIntegrity(
      this.prisma,
      dto.requestForm.department,
      dto.requestForm.position,
    );
    await assertOptionalUserExists(
      this.prisma,
      dto.hiringManagerId,
      'hiringManagerId',
    );
    await assertOptionalUserExists(
      this.prisma,
      dto.requestForm.replaceForUserId,
      'requestForm.replaceForUserId',
    );
    assertSalaryRange(
      dto.jobDetailsForm.salaryMin ?? null,
      dto.jobDetailsForm.salaryMax ?? null,
    );

    const slug = await generateUniqueSlug(
      this.prisma,
      dto.requestForm.jobTitle,
    );
    const creatorId = principal.userId ?? principal.sub;
    const creatorIsHr =
      principal.roles?.includes(SYSTEM_ROLES.HR) ||
      principal.roles?.includes(SYSTEM_ROLES.HR_MANAGER) ||
      false;
    const location = parseLocation(dto.jobDetailsForm.location);
    const skills = normalizeStringArray(dto.jobDetailsForm.skills);
    const responsibilities = normalizeStringArray(
      dto.jobDetailsForm.responsibilities,
    );

    const created = await this.prisma.job.create({
      data: {
        title: dto.requestForm.jobTitle,
        slug,
        departmentId: dto.requestForm.department,
        positionId: dto.requestForm.position,
        description: dto.jobDetailsForm.jobSummary as Prisma.InputJsonValue,
        summary:
          (dto.jobDetailsForm.whyJoinUs as Prisma.InputJsonValue | null) ??
          undefined,
        experienceLevel: dto.jobDetailsForm.experienceLevel,
        contractType: EMPLOYMENT_TO_CONTRACT[dto.requestForm.employmentType],
        employmentType: dto.requestForm.employmentType,
        workLocationType: dto.requestForm.workMode,
        city: location.city ?? undefined,
        country: location.country ?? undefined,
        openings: dto.jobDetailsForm.openings,
        salaryMin: dto.jobDetailsForm.salaryMin ?? undefined,
        salaryMax: dto.jobDetailsForm.salaryMax ?? undefined,
        currency:
          currencyOrNull(dto.jobDetailsForm.salaryCurrency) ?? undefined,
        salaryMode: dto.jobDetailsForm.salaryMode,
        benefits: dto.jobDetailsForm.benefits ?? [],
        skills,
        responsibilities,
        creatorIsHr,
        priority: dto.priority ?? 'MEDIUM',
        hiringManagerId: dto.hiringManagerId ?? undefined,
        applicationDeadline: new Date(dto.jobDetailsForm.applicationDeadline),
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
            detailsForm: {
              create: {
                jobTitle: dto.jobDetailsForm.jobTitle,
                location: dto.jobDetailsForm.location,
                workMode: dto.jobDetailsForm.workMode,
                employmentType: dto.jobDetailsForm.employmentType,
                jobSummary: dto.jobDetailsForm
                  .jobSummary as Prisma.InputJsonValue,
                whyJoinUs:
                  (dto.jobDetailsForm
                    .whyJoinUs as Prisma.InputJsonValue | null) ?? undefined,
                skills,
                responsibilities,
                preferredSkills:
                  dto.jobDetailsForm.preferredSkills ?? undefined,
                experienceLevel: dto.jobDetailsForm.experienceLevel,
                salaryMin: dto.jobDetailsForm.salaryMin ?? undefined,
                salaryMax: dto.jobDetailsForm.salaryMax ?? undefined,
                salaryCurrency:
                  currencyOrNull(dto.jobDetailsForm.salaryCurrency) ??
                  undefined,
                salaryMode: dto.jobDetailsForm.salaryMode,
                benefits: dto.jobDetailsForm.benefits ?? [],
                openings: dto.jobDetailsForm.openings,
                applicationDeadline: new Date(
                  dto.jobDetailsForm.applicationDeadline,
                ),
                applicationForm: {
                  create: {
                    predefinedFields: {
                      create: dto.applicationForm.predefinedFields.map(
                        (field, index) => ({
                          key: field.key,
                          enabled: field.enabled,
                          required: field.required,
                          order: index + 1,
                        }),
                      ),
                    },
                    customFields: {
                      create: dto.applicationForm.customFields.map(
                        (field, index) => ({
                          customFieldId: field.id,
                          label: field.label,
                          type: field.type,
                          required: field.required,
                          helpText: field.helpText ?? undefined,
                          order: index + 1,
                          options: {
                            create: (field.options ?? []).map(
                              (option, optionIndex) => ({
                                value: option,
                                order: optionIndex + 1,
                              }),
                            ),
                          },
                        }),
                      ),
                    },
                  },
                },
              },
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
    validateFormConsistency(merged.requestForm, merged.jobDetailsForm);
    validateApplicationCustomFieldOptions(merged.applicationForm.customFields);
    validatePredefinedFieldKeys(merged.applicationForm.predefinedFields);

    await assertDepartmentPositionIntegrity(
      this.prisma,
      merged.requestForm.department,
      merged.requestForm.position,
    );
    await assertOptionalUserExists(
      this.prisma,
      dto.hiringManagerId,
      'hiringManagerId',
    );
    await assertOptionalUserExists(
      this.prisma,
      merged.requestForm.replaceForUserId,
      'requestForm.replaceForUserId',
    );
    assertSalaryRange(
      merged.jobDetailsForm.salaryMin ?? null,
      merged.jobDetailsForm.salaryMax ?? null,
    );

    const location = parseLocation(merged.jobDetailsForm.location);
    const skills = normalizeStringArray(merged.jobDetailsForm.skills);
    const responsibilities = normalizeStringArray(
      merged.jobDetailsForm.responsibilities,
    );

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.job.update({
        where: { id },
        data: {
          title: merged.requestForm.jobTitle,
          departmentId: merged.requestForm.department,
          positionId: merged.requestForm.position,
          description: merged.jobDetailsForm
            .jobSummary as Prisma.InputJsonValue,
          summary:
            (merged.jobDetailsForm.whyJoinUs as Prisma.InputJsonValue | null) ??
            Prisma.DbNull,
          experienceLevel: merged.jobDetailsForm.experienceLevel,
          contractType:
            EMPLOYMENT_TO_CONTRACT[merged.requestForm.employmentType],
          employmentType: merged.requestForm.employmentType,
          workLocationType: merged.requestForm.workMode,
          city: location.city,
          country: location.country,
          openings: merged.jobDetailsForm.openings,
          salaryMin: merged.jobDetailsForm.salaryMin ?? null,
          salaryMax: merged.jobDetailsForm.salaryMax ?? null,
          currency: currencyOrNull(merged.jobDetailsForm.salaryCurrency),
          salaryMode: merged.jobDetailsForm.salaryMode,
          benefits: merged.jobDetailsForm.benefits ?? [],
          skills,
          responsibilities,
          applicationDeadline: new Date(
            merged.jobDetailsForm.applicationDeadline,
          ),
          ...(dto.priority !== undefined && { priority: dto.priority }),
          ...(dto.hiringManagerId !== undefined && {
            hiringManagerId: dto.hiringManagerId,
          }),
        },
      });

      const requestForm = await tx.jobRequestForm.upsert({
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
        select: { id: true },
      });

      const detailsForm = await tx.jobDetailsForm.upsert({
        where: { requestFormId: requestForm.id },
        create: {
          requestFormId: requestForm.id,
          jobTitle: merged.jobDetailsForm.jobTitle,
          location: merged.jobDetailsForm.location,
          workMode: merged.jobDetailsForm.workMode,
          employmentType: merged.jobDetailsForm.employmentType,
          jobSummary: merged.jobDetailsForm.jobSummary as Prisma.InputJsonValue,
          whyJoinUs:
            (merged.jobDetailsForm.whyJoinUs as Prisma.InputJsonValue | null) ??
            undefined,
          skills,
          responsibilities,
          preferredSkills: merged.jobDetailsForm.preferredSkills ?? undefined,
          experienceLevel: merged.jobDetailsForm.experienceLevel,
          salaryMin: merged.jobDetailsForm.salaryMin ?? undefined,
          salaryMax: merged.jobDetailsForm.salaryMax ?? undefined,
          salaryCurrency:
            currencyOrNull(merged.jobDetailsForm.salaryCurrency) ?? undefined,
          salaryMode: merged.jobDetailsForm.salaryMode,
          benefits: merged.jobDetailsForm.benefits ?? [],
          openings: merged.jobDetailsForm.openings,
          applicationDeadline: new Date(
            merged.jobDetailsForm.applicationDeadline,
          ),
        },
        update: {
          jobTitle: merged.jobDetailsForm.jobTitle,
          location: merged.jobDetailsForm.location,
          workMode: merged.jobDetailsForm.workMode,
          employmentType: merged.jobDetailsForm.employmentType,
          jobSummary: merged.jobDetailsForm.jobSummary as Prisma.InputJsonValue,
          whyJoinUs:
            (merged.jobDetailsForm.whyJoinUs as Prisma.InputJsonValue | null) ??
            Prisma.DbNull,
          skills,
          responsibilities,
          preferredSkills: merged.jobDetailsForm.preferredSkills ?? null,
          experienceLevel: merged.jobDetailsForm.experienceLevel,
          salaryMin: merged.jobDetailsForm.salaryMin ?? null,
          salaryMax: merged.jobDetailsForm.salaryMax ?? null,
          salaryCurrency: currencyOrNull(merged.jobDetailsForm.salaryCurrency),
          salaryMode: merged.jobDetailsForm.salaryMode,
          benefits: merged.jobDetailsForm.benefits ?? [],
          openings: merged.jobDetailsForm.openings,
          applicationDeadline: new Date(
            merged.jobDetailsForm.applicationDeadline,
          ),
        },
        select: { id: true },
      });

      const applicationForm = await tx.jobApplicationForm.upsert({
        where: { jobDetailsFormId: detailsForm.id },
        create: { jobDetailsFormId: detailsForm.id },
        update: {},
        select: { id: true },
      });

      await tx.jobApplicationPredefinedField.deleteMany({
        where: { jobApplicationFormId: applicationForm.id },
      });
      if (merged.applicationForm.predefinedFields.length > 0) {
        await tx.jobApplicationPredefinedField.createMany({
          data: merged.applicationForm.predefinedFields.map((field, index) => ({
            jobApplicationFormId: applicationForm.id,
            key: field.key,
            enabled: field.enabled,
            required: field.required,
            order: index + 1,
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
        skills: true,
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
      include: {
        requestForm: {
          include: {
            detailsForm: {
              select: { id: true },
            },
          },
        },
      },
    });
    if (!job) throw new NotFoundException('Job not found');

    const skills = normalizeStringArray(dto.skills);
    await this.prisma.$transaction(async (tx) => {
      await tx.job.update({
        where: { id },
        data: { skills },
      });

      const detailsFormId = job.requestForm?.detailsForm?.id;
      if (detailsFormId) {
        await tx.jobDetailsForm.update({
          where: { id: detailsFormId },
          data: { skills },
        });
      }
    });

    return skills;
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
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        requestForm: {
          include: {
            detailsForm: {
              select: { id: true },
            },
          },
        },
      },
    });
    if (!job) throw new NotFoundException('Job not found');

    const responsibilities = normalizeStringArray(dto.responsibilities);
    await this.prisma.$transaction(async (tx) => {
      await tx.job.update({
        where: { id },
        data: { responsibilities },
      });

      const detailsFormId = job.requestForm?.detailsForm?.id;
      if (detailsFormId) {
        await tx.jobDetailsForm.update({
          where: { id: detailsFormId },
          data: { responsibilities },
        });
      }
    });

    return responsibilities;
  }
}
