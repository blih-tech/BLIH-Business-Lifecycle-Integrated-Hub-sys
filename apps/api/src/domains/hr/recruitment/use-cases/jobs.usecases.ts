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

const splitLines = (value: string) =>
  value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

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
      replaceFor: job.requestForm.replaceFor ?? undefined,
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
      keyResponsibilities: job.requestForm.detailsForm.keyResponsibilities,
      skills: (job.requestForm.detailsForm.skills ?? []).map((skill: any) => ({
        name: skill.name,
        level: skill.level ?? undefined,
        required: skill.required,
        order: skill.order ?? undefined,
      })),
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
    const responsibilities = splitLines(dto.jobDetailsForm.keyResponsibilities);

    const created = await this.prisma.job.create({
      data: {
        title: dto.requestForm.jobTitle,
        slug,
        departmentId: dto.requestForm.department,
        positionId: dto.requestForm.position,
        description: dto.jobDetailsForm.jobSummary,
        summary: dto.jobDetailsForm.whyJoinUs ?? undefined,
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
        creatorIsHr,
        applicationDeadline: new Date(dto.jobDetailsForm.applicationDeadline),
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
            replaceFor: dto.requestForm.replaceFor ?? undefined,
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
                jobSummary: dto.jobDetailsForm.jobSummary,
                whyJoinUs: dto.jobDetailsForm.whyJoinUs ?? undefined,
                keyResponsibilities: dto.jobDetailsForm.keyResponsibilities,
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
                skills: {
                  create: dto.jobDetailsForm.skills.map((skill) => ({
                    name: skill.name,
                    level: skill.level ?? undefined,
                    required: skill.required ?? true,
                    order: skill.order ?? undefined,
                  })),
                },
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
        skills: {
          create: dto.jobDetailsForm.skills.map((skill) => ({
            name: skill.name,
            level: skill.level ?? undefined,
            required: skill.required ?? true,
            order: skill.order ?? undefined,
          })),
        },
        responsibilities: {
          create: responsibilities.map((description, index) => ({
            description,
            order: index + 1,
          })),
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
    assertSalaryRange(
      merged.jobDetailsForm.salaryMin ?? null,
      merged.jobDetailsForm.salaryMax ?? null,
    );

    const location = parseLocation(merged.jobDetailsForm.location);
    const responsibilities = splitLines(
      merged.jobDetailsForm.keyResponsibilities,
    );

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.job.update({
        where: { id },
        data: {
          title: merged.requestForm.jobTitle,
          departmentId: merged.requestForm.department,
          positionId: merged.requestForm.position,
          description: merged.jobDetailsForm.jobSummary,
          summary: merged.jobDetailsForm.whyJoinUs ?? null,
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
          applicationDeadline: new Date(
            merged.jobDetailsForm.applicationDeadline,
          ),
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
          replaceFor: merged.requestForm.replaceFor ?? undefined,
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
          replaceFor: merged.requestForm.replaceFor ?? null,
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
          jobSummary: merged.jobDetailsForm.jobSummary,
          whyJoinUs: merged.jobDetailsForm.whyJoinUs ?? undefined,
          keyResponsibilities: merged.jobDetailsForm.keyResponsibilities,
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
          jobSummary: merged.jobDetailsForm.jobSummary,
          whyJoinUs: merged.jobDetailsForm.whyJoinUs ?? null,
          keyResponsibilities: merged.jobDetailsForm.keyResponsibilities,
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

      await tx.jobDetailSkill.deleteMany({
        where: { jobDetailsFormId: detailsForm.id },
      });
      if (merged.jobDetailsForm.skills.length > 0) {
        await tx.jobDetailSkill.createMany({
          data: merged.jobDetailsForm.skills.map((skill, index) => ({
            jobDetailsFormId: detailsForm.id,
            name: skill.name,
            level: skill.level ?? undefined,
            required: skill.required ?? true,
            order: skill.order ?? index + 1,
          })),
        });
      }

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

      await tx.jobSkill.deleteMany({ where: { jobId: id } });
      if (merged.jobDetailsForm.skills.length > 0) {
        await tx.jobSkill.createMany({
          data: merged.jobDetailsForm.skills.map((skill, index) => ({
            jobId: id,
            name: skill.name,
            level: skill.level ?? undefined,
            required: skill.required ?? true,
            order: skill.order ?? index + 1,
          })),
        });
      }

      await tx.jobResponsibility.deleteMany({ where: { jobId: id } });
      if (responsibilities.length > 0) {
        await tx.jobResponsibility.createMany({
          data: responsibilities.map((description, index) => ({
            jobId: id,
            description,
            order: index + 1,
          })),
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
        data: {
          status: 'PENDING_FOR_APPROVAL',
          financeApprovalStatus: 'PENDING_FOR_APPROVAL',
          gmApprovalStatus: 'PENDING_FOR_APPROVAL',
          hrApprovalStatus: 'PENDING_FOR_APPROVAL',
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
    const job = await this.prisma.job.findUniqueOrThrow({
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
    await this.prisma.$transaction(async (tx) => {
      await tx.jobSkill.deleteMany({ where: { jobId: id } });
      if (dto.skills.length > 0) {
        await tx.jobSkill.createMany({
          data: dto.skills.map((skill, index) => ({
            jobId: id,
            name: skill.name,
            level: skill.level ?? undefined,
            required: skill.required ?? true,
            order: skill.order ?? index + 1,
          })),
        });
      }

      const detailsFormId = job.requestForm?.detailsForm?.id;
      if (detailsFormId) {
        await tx.jobDetailSkill.deleteMany({
          where: { jobDetailsFormId: detailsFormId },
        });
        if (dto.skills.length > 0) {
          await tx.jobDetailSkill.createMany({
            data: dto.skills.map((skill, index) => ({
              jobDetailsFormId: detailsFormId,
              name: skill.name,
              level: skill.level ?? undefined,
              required: skill.required ?? true,
              order: skill.order ?? index + 1,
            })),
          });
        }
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
    const job = await this.prisma.job.findUniqueOrThrow({
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
    await this.prisma.$transaction(async (tx) => {
      await tx.jobResponsibility.deleteMany({ where: { jobId: id } });
      if (dto.responsibilities.length > 0) {
        await tx.jobResponsibility.createMany({
          data: dto.responsibilities.map((responsibility, index) => ({
            jobId: id,
            description: responsibility.description,
            order: responsibility.order ?? index + 1,
          })),
        });
      }

      const detailsFormId = job.requestForm?.detailsForm?.id;
      if (detailsFormId) {
        await tx.jobDetailsForm.update({
          where: { id: detailsFormId },
          data: {
            keyResponsibilities: dto.responsibilities
              .map((responsibility) => responsibility.description.trim())
              .filter(Boolean)
              .join('\n'),
          },
        });
      }
    });
    return this.prisma.jobResponsibility.findMany({
      where: { jobId: id },
      orderBy: { order: 'asc' },
    });
  }
}
