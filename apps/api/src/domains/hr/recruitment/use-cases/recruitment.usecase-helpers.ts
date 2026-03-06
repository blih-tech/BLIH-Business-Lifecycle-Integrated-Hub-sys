import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../../../../platform/prisma/prisma.service';
import { SYSTEM_ROLES } from '../../../../shared/constants/system-roles.constant';

const PREDEFINED_FIELD_METADATA: Record<
  string,
  { label: string; type: 'TEXT' | 'TEXTAREA' | 'NUMBER' | 'FILE' }
> = {
  FULL_NAME: { label: 'Full Name', type: 'TEXT' },
  EMAIL: { label: 'Email', type: 'TEXT' },
  PHONE: { label: 'Phone', type: 'TEXT' },
  RESUME: { label: 'Resume', type: 'FILE' },
  COVER_LETTER: { label: 'Cover Letter', type: 'TEXTAREA' },
  LINKEDIN: { label: 'LinkedIn', type: 'TEXT' },
  PORTFOLIO: { label: 'Portfolio', type: 'TEXT' },
  GITHUB: { label: 'GitHub', type: 'TEXT' },
  CURRENT_COMPANY: { label: 'Current Company', type: 'TEXT' },
  CURRENT_POSITION: { label: 'Current Position', type: 'TEXT' },
  YEARS_EXPERIENCE: { label: 'Years of Experience', type: 'NUMBER' },
};

export const jobInclude = {
  approvals: { orderBy: { level: 'asc' as const } },
  skills: { orderBy: { order: 'asc' as const } },
  tools: { orderBy: { order: 'asc' as const } },
  responsibilities: { orderBy: { order: 'asc' as const } },
  requestForm: {
    include: {
      detailsForm: {
        include: {
          skills: { orderBy: { order: 'asc' as const } },
          applicationForm: {
            include: {
              predefinedFields: { orderBy: { order: 'asc' as const } },
              customFields: {
                orderBy: { order: 'asc' as const },
                include: { options: { orderBy: { order: 'asc' as const } } },
              },
            },
          },
        },
      },
    },
  },
};

type ApprovalStage = 'FINANCE' | 'GM' | 'HR_REVIEW';
type ApprovalDecision = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ApprovalState {
  id: string;
  stage: ApprovalStage;
  decision: ApprovalDecision;
}

interface SubmitReadinessPayload {
  title: string;
  description: string;
  departmentId: string | null;
  positionId: string | null;
  experienceLevel: string | null;
  contractType: string | null;
  workLocationType: string | null;
  openings: number | null;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string | null;
  applicationDeadline: Date | null;
  skills: unknown[];
  responsibilities: unknown[];
}

const APPLICATION_TRANSITIONS: Record<string, string[]> = {
  NEW: ['SCREENING', 'REJECTED', 'WITHDRAWN'],
  SCREENING: ['SHORTLISTED', 'REJECTED', 'WITHDRAWN'],
  SHORTLISTED: ['INTERVIEW_STAGE', 'REJECTED', 'WITHDRAWN'],
  INTERVIEW_STAGE: ['OFFER_PENDING', 'REJECTED', 'WITHDRAWN'],
  OFFER_PENDING: ['HIRED', 'REJECTED', 'WITHDRAWN'],
  HIRED: [],
  REJECTED: [],
  WITHDRAWN: [],
};

const INTERVIEW_TRANSITIONS: Record<string, string[]> = {
  SCHEDULED: ['COMPLETED', 'CANCELLED', 'NO_SHOW'],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
};

export function currentApprovalStage(status: string) {
  if (status !== 'PENDING_FOR_APPROVAL') return null;
  return 'FINANCE';
}

export function requiredRoleForStage(stage: 'FINANCE' | 'GM' | 'HR_REVIEW') {
  if (stage === 'FINANCE') return SYSTEM_ROLES.FINANCE_MANAGER;
  if (stage === 'GM') return SYSTEM_ROLES.SUPERADMIN;
  return SYSTEM_ROLES.HR_MANAGER;
}

export function isApprovalStageActionable(
  stage: ApprovalStage,
  approvals: ApprovalState[],
) {
  if (approvals.some((approval) => approval.decision === 'REJECTED')) {
    return false;
  }

  const finance = approvals.find((approval) => approval.stage === 'FINANCE');
  const gm = approvals.find((approval) => approval.stage === 'GM');
  const hr = approvals.find((approval) => approval.stage === 'HR_REVIEW');

  if (!finance || !gm || !hr) {
    throw new BadRequestException('Missing approval stage configuration');
  }

  if (stage === 'FINANCE') {
    return finance.decision === 'PENDING';
  }
  if (stage === 'GM') {
    return gm.decision === 'PENDING';
  }

  return (
    finance.decision === 'APPROVED' &&
    gm.decision === 'APPROVED' &&
    hr.decision === 'PENDING'
  );
}

export function computeJobStatusFromApprovals(approvals: ApprovalState[]) {
  const finance = approvals.find((approval) => approval.stage === 'FINANCE');
  const gm = approvals.find((approval) => approval.stage === 'GM');
  const hr = approvals.find((approval) => approval.stage === 'HR_REVIEW');

  if (!finance || !gm || !hr) {
    throw new BadRequestException('Missing approval stage configuration');
  }

  if (approvals.some((approval) => approval.decision === 'REJECTED')) {
    return 'REJECTED' as const;
  }

  if (
    finance.decision === 'APPROVED' &&
    gm.decision === 'APPROVED' &&
    hr.decision === 'APPROVED'
  ) {
    return 'READY_TO_POST' as const;
  }

  return 'PENDING_FOR_APPROVAL' as const;
}

export function approvalDecisionToStageStatus(decision: ApprovalDecision) {
  if (decision === 'APPROVED') return 'APPROVED' as const;
  if (decision === 'REJECTED') return 'REJECTED' as const;
  return 'PENDING_FOR_APPROVAL' as const;
}

export function assertApplicationTransition(
  currentStatus: string,
  nextStatus: string,
) {
  if (currentStatus === nextStatus) return;
  const allowed = APPLICATION_TRANSITIONS[currentStatus] ?? [];
  if (!allowed.includes(nextStatus)) {
    throw new BadRequestException(
      `Job application status cannot transition from ${currentStatus} to ${nextStatus}`,
    );
  }
}

export function assertInterviewTransition(
  currentStatus: string,
  nextStatus: string,
) {
  if (currentStatus === nextStatus) return;
  const allowed = INTERVIEW_TRANSITIONS[currentStatus] ?? [];
  if (!allowed.includes(nextStatus)) {
    throw new BadRequestException(
      `Interview status cannot transition from ${currentStatus} to ${nextStatus}`,
    );
  }
}

export function assertSalaryRange(
  salaryMin: number | null,
  salaryMax: number | null,
) {
  if (salaryMin == null || salaryMax == null) return;
  if (salaryMin > salaryMax) {
    throw new BadRequestException('salaryMin cannot be greater than salaryMax');
  }
}

export function assertSubmitReadiness(job: SubmitReadinessPayload) {
  if (!job.title?.trim()) {
    throw new BadRequestException('title is required before submit');
  }
  if (!job.description?.trim()) {
    throw new BadRequestException('description is required before submit');
  }
  if (!job.departmentId) {
    throw new BadRequestException('departmentId is required before submit');
  }
  if (!job.positionId) {
    throw new BadRequestException('positionId is required before submit');
  }
  if (!job.experienceLevel) {
    throw new BadRequestException('experienceLevel is required before submit');
  }
  if (!job.contractType) {
    throw new BadRequestException('contractType is required before submit');
  }
  if (!job.workLocationType) {
    throw new BadRequestException('workLocationType is required before submit');
  }
  if (!job.openings || job.openings < 1) {
    throw new BadRequestException('openings must be at least 1 before submit');
  }
  assertSalaryRange(job.salaryMin, job.salaryMax);

  if ((job.skills?.length ?? 0) < 1) {
    throw new BadRequestException(
      'At least one skill is required before submit',
    );
  }
  if ((job.responsibilities?.length ?? 0) < 1) {
    throw new BadRequestException(
      'At least one responsibility is required before submit',
    );
  }
  if (!job.applicationDeadline) {
    throw new BadRequestException(
      'applicationDeadline is required before submit',
    );
  }
  if (job.applicationDeadline.getTime() <= Date.now()) {
    throw new BadRequestException(
      'applicationDeadline must be a future date before submit',
    );
  }
}

export async function assertDepartmentPositionIntegrity(
  prisma: PrismaService,
  departmentId: string,
  positionId: string,
) {
  const [department, position] = await Promise.all([
    prisma.department.findUnique({
      where: { id: departmentId },
      select: { id: true },
    }),
    prisma.position.findUnique({
      where: { id: positionId },
      select: { id: true, departmentId: true },
    }),
  ]);

  if (!department) {
    throw new NotFoundException('Department not found');
  }
  if (!position) {
    throw new NotFoundException('Position not found');
  }
  if (position.departmentId !== department.id) {
    throw new BadRequestException(
      'positionId does not belong to the selected departmentId',
    );
  }
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function generateUniqueSlug(prisma: PrismaService, title: string) {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  const safeBase = base || 'job';
  let slug = safeBase;
  let attempt = 1;
  while (true) {
    const existing = await prisma.job.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!existing) return slug;
    attempt += 1;
    slug = `${safeBase}-${attempt}`;
  }
}

function decimalToString(value: unknown) {
  if (value == null) return null;
  return String(value);
}

function dateToIso(value: Date | null | undefined) {
  if (!value) return null;
  return value.toISOString();
}

function snakeToCamel(key: string) {
  return key.toLowerCase().replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

export function mapJob(job: any) {
  const requestForm = job.requestForm;
  const detailsForm = requestForm?.detailsForm;
  const applicationForm = detailsForm?.applicationForm;

  return {
    id: job.id,
    slug: job.slug,
    status: job.status,
    financeApprovalStatus: job.financeApprovalStatus,
    gmApprovalStatus: job.gmApprovalStatus,
    hrApprovalStatus: job.hrApprovalStatus,
    creatorIsHr: job.creatorIsHr,
    publishedAt: dateToIso(job.publishedAt),
    createdById: job.createdById ?? null,
    requestForm: requestForm
      ? {
          id: requestForm.id,
          jobTitle: requestForm.jobTitle,
          department: requestForm.departmentId,
          requestedBy: requestForm.requestedBy,
          position: requestForm.positionId,
          requestType: requestForm.requestType,
          replaceFor: requestForm.replaceFor ?? null,
          businessJustification: requestForm.businessJustification,
          employmentType: requestForm.employmentType,
          workMode: requestForm.workMode,
          urgency: requestForm.urgency,
          neededByDate: dateToIso(requestForm.neededByDate),
        }
      : null,
    jobDetailsForm: detailsForm
      ? {
          id: detailsForm.id,
          jobTitle: detailsForm.jobTitle,
          location: detailsForm.location,
          workMode: detailsForm.workMode,
          employmentType: detailsForm.employmentType,
          jobSummary: detailsForm.jobSummary,
          whyJoinUs: detailsForm.whyJoinUs ?? null,
          keyResponsibilities: detailsForm.keyResponsibilities,
          skills: (detailsForm.skills ?? []).map((skill: any) => ({
            id: skill.id,
            name: skill.name,
            level: skill.level ?? null,
            required: skill.required,
            order: skill.order ?? null,
          })),
          preferredSkills: detailsForm.preferredSkills ?? null,
          experienceLevel: detailsForm.experienceLevel,
          salaryMin: decimalToString(detailsForm.salaryMin),
          salaryMax: decimalToString(detailsForm.salaryMax),
          salaryCurrency: detailsForm.salaryCurrency ?? null,
          salaryMode: detailsForm.salaryMode,
          benefits: detailsForm.benefits ?? [],
          openings: detailsForm.openings,
          applicationDeadline: dateToIso(detailsForm.applicationDeadline),
        }
      : null,
    applicationForm: applicationForm
      ? {
          id: applicationForm.id,
          predefinedFields: (applicationForm.predefinedFields ?? []).map(
            (field: any) => {
              const meta = PREDEFINED_FIELD_METADATA[field.key] ?? {
                label: field.key,
                type: 'TEXT' as const,
              };
              return {
                id: field.id,
                key: snakeToCamel(field.key),
                label: meta.label,
                type: meta.type,
                enabled: field.enabled,
                required: field.required,
              };
            },
          ),
          customFields: (applicationForm.customFields ?? []).map(
            (field: any) => ({
              id: field.customFieldId,
              label: field.label,
              type: field.type,
              required: field.required,
              helpText: field.helpText ?? null,
              options: (field.options ?? []).map((option: any) => option.value),
            }),
          ),
        }
      : null,
    approvals: (job.approvals ?? []).map((approval: any) => ({
      ...approval,
      decidedAt: dateToIso(approval.decidedAt),
      createdAt: approval.createdAt.toISOString(),
    })),
    skills: (job.skills ?? []).map((skill: any) => ({
      ...skill,
      level: skill.level ?? null,
    })),
    tools: job.tools ?? [],
    responsibilities: job.responsibilities ?? [],
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
  };
}

export function mapCandidate(candidate: any) {
  return {
    ...candidate,
    createdAt: candidate.createdAt.toISOString(),
    updatedAt: candidate.updatedAt.toISOString(),
  };
}

export function mapApplication(application: any) {
  return {
    ...application,
    expectedSalary: decimalToString(application.expectedSalary),
    appliedAt: application.appliedAt.toISOString(),
    sourceSnapshot:
      application.sourceSnapshot &&
      typeof application.sourceSnapshot === 'object' &&
      !Array.isArray(application.sourceSnapshot)
        ? application.sourceSnapshot
        : null,
    createdAt: application.createdAt.toISOString(),
    updatedAt: application.updatedAt.toISOString(),
  };
}

export function mapInterview(interview: any) {
  return {
    ...interview,
    scheduledAt: interview.scheduledAt?.toISOString() ?? null,
    completedAt: interview.completedAt?.toISOString() ?? null,
    score: decimalToString(interview.score),
    createdAt: interview.createdAt.toISOString(),
    updatedAt: interview.updatedAt.toISOString(),
  };
}
