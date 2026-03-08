import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../../../../platform/prisma/prisma.service';
import { SYSTEM_ROLES } from '../../../../shared/constants/system-roles.constant';

export const jobInclude = {
  approvals: { orderBy: { level: 'asc' as const } },
  requestForm: true,
  applicationForm: {
    include: {
      applicantFields: {
        orderBy: { order: 'asc' as const },
      },
      customFields: {
        orderBy: { order: 'asc' as const },
        include: { options: { orderBy: { order: 'asc' as const } } },
      },
    },
  },
};

export const applicantInclude = {
  educations: { orderBy: { startDate: 'desc' as const } },
  experiences: { orderBy: { startDate: 'desc' as const } },
  statusHistory: { orderBy: { changedAt: 'desc' as const } },
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
  description: unknown;
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
  requiredSkills: unknown[];
  responsibilities: unknown[];
}

const APPLICANT_TRANSITIONS: Record<string, string[]> = {
  APPLIED: ['SHORTLISTED', 'REJECTED'],
  SHORTLISTED: ['INTERVIEW', 'REJECTED'],
  INTERVIEW: ['OFFER', 'REJECTED'],
  OFFER: ['HIRED', 'REJECTED'],
  HIRED: [],
  REJECTED: [],
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

export function assertApplicantTransition(
  currentStatus: string,
  nextStatus: string,
) {
  if (currentStatus === nextStatus) return;
  const allowed = APPLICANT_TRANSITIONS[currentStatus] ?? [];
  if (!allowed.includes(nextStatus)) {
    throw new BadRequestException(
      `Applicant status cannot transition from ${currentStatus} to ${nextStatus}`,
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
  if (!isNonEmptyObject(job.description)) {
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

  if ((job.requiredSkills?.length ?? 0) < 1) {
    throw new BadRequestException(
      'At least one required skill is required before submit',
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

function toObjectRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function isNonEmptyObject(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  return Object.keys(value as Record<string, unknown>).length > 0;
}

export function normalizeStringArray(values: string[] | null | undefined) {
  const seen = new Set<string>();
  const normalized: string[] = [];
  for (const value of values ?? []) {
    const trimmed = value.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    normalized.push(trimmed);
  }
  return normalized;
}

export function normalizeSkillArray(values: string[] | null | undefined) {
  const seen = new Set<string>();
  const normalized: string[] = [];
  for (const value of values ?? []) {
    const trimmed = value.trim().toLowerCase();
    if (!trimmed) continue;
    if (seen.has(trimmed)) continue;
    seen.add(trimmed);
    normalized.push(trimmed);
  }
  return normalized;
}

export function buildInterviewMetadata(input: {
  applicantId: string;
  round: number;
  interviewers?: unknown[] | null;
  feedback?: string | null;
  endorsement?: string | null;
  score?: number | null;
  nextAction?: string | null;
}) {
  return {
    applicantId: input.applicantId,
    round: input.round,
    interviewers: input.interviewers ?? null,
    feedback: input.feedback ?? null,
    endorsement: input.endorsement ?? null,
    score: input.score ?? null,
    nextAction: input.nextAction ?? null,
  };
}

export function parseInterviewMetadata(value: unknown) {
  const payload = toObjectRecord(value);

  return {
    applicantId:
      typeof payload?.applicantId === 'string' ? payload.applicantId : '',
    round:
      typeof payload?.round === 'number' && Number.isInteger(payload.round)
        ? payload.round
        : 1,
    interviewers: Array.isArray(payload?.interviewers)
      ? payload.interviewers
      : null,
    feedback: typeof payload?.feedback === 'string' ? payload.feedback : null,
    endorsement:
      typeof payload?.endorsement === 'string' ? payload.endorsement : null,
    score: typeof payload?.score === 'number' ? payload.score : null,
    nextAction:
      typeof payload?.nextAction === 'string' ? payload.nextAction : null,
  };
}

export function mapJob(job: any) {
  const requestForm = job.requestForm;
  const applicationForm = job.applicationForm;

  return {
    requestForm: requestForm
      ? {
          id: requestForm.id,
          jobTitle: requestForm.jobTitle,
          department: requestForm.departmentId,
          requestedBy: requestForm.requestedBy,
          position: requestForm.positionId,
          requestType: requestForm.requestType,
          replaceForUserId: requestForm.replaceForUserId ?? null,
          businessJustification: requestForm.businessJustification,
          employmentType: requestForm.employmentType,
          workMode: requestForm.workMode,
          urgency: requestForm.urgency,
          neededByDate: dateToIso(requestForm.neededByDate),
        }
      : null,
    job: {
      id: job.id,
      title: job.title,
      slug: job.slug,
      departmentId: job.departmentId,
      positionId: job.positionId,
      description: job.description,
      summary: toObjectRecord(job.summary),
      experienceLevel: job.experienceLevel ?? null,
      contractType: job.contractType,
      employmentType: job.employmentType ?? null,
      workLocationType: job.workLocationType,
      remoteScope: job.remoteScope ?? null,
      city: job.city ?? null,
      country: job.country ?? null,
      openings: job.openings,
      salaryMin: decimalToString(job.salaryMin),
      salaryMax: decimalToString(job.salaryMax),
      currency: job.currency ?? null,
      salaryMode: job.salaryMode,
      benefits: job.benefits ?? [],
      requiredSkills: job.requiredSkills ?? [],
      preferredSkills: job.preferredSkills ?? [],
      responsibilities: job.responsibilities ?? [],
      tools: job.tools ?? [],
      priority: job.priority,
      hiringManagerId: job.hiringManagerId ?? null,
      applicationDeadline: dateToIso(job.applicationDeadline),
      status: job.status,
      financeApprovalStatus: job.financeApprovalStatus,
      gmApprovalStatus: job.gmApprovalStatus,
      hrApprovalStatus: job.hrApprovalStatus,
      creatorIsHr: job.creatorIsHr,
      draftedAt: dateToIso(job.draftedAt),
      pendingApprovalAt: dateToIso(job.pendingApprovalAt),
      readyToPostAt: dateToIso(job.readyToPostAt),
      publishedAt: dateToIso(job.publishedAt),
      closedAt: dateToIso(job.closedAt),
      rejectedAt: dateToIso(job.rejectedAt),
      closingReason: job.closingReason ?? null,
      viewsCount: job.viewsCount ?? 0,
      applicationsCount: job.applicationsCount ?? 0,
      shortlistedCount: job.shortlistedCount ?? 0,
      interviewsCount: job.interviewsCount ?? 0,
      offersCount: job.offersCount ?? 0,
      hiresCount: job.hiresCount ?? 0,
      createdById: job.createdById ?? null,
      createdAt: job.createdAt.toISOString(),
      updatedAt: job.updatedAt.toISOString(),
    },
    applicationForm: applicationForm
      ? {
          id: applicationForm.id,
          jobId: applicationForm.jobId,
          applicantFields: (applicationForm.applicantFields ?? []).map(
            (field: any, index: number) => ({
              id: field.id,
              key: field.key,
              enabled: field.enabled,
              required: field.required,
              order: field.order ?? index + 1,
            }),
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
  };
}

export function mapApplicant(applicant: any) {
  return {
    id: applicant.id,
    jobId: applicant.jobId,
    applicationFormId: applicant.applicationFormId ?? null,
    fullName: applicant.fullName,
    email: applicant.email,
    phone: applicant.phone ?? null,
    resumeUrl: applicant.resumeUrl ?? null,
    linkedinUrl: applicant.linkedinUrl ?? null,
    portfolioUrl: applicant.portfolioUrl ?? null,
    githubUrl: applicant.githubUrl ?? null,
    source: applicant.source,
    referredById: applicant.referredById ?? null,
    currentCompany: applicant.currentCompany ?? null,
    currentPosition: applicant.currentPosition ?? null,
    yearsExperience: applicant.yearsExperience ?? null,
    location: applicant.location ?? null,
    country: applicant.country ?? null,
    city: applicant.city ?? null,
    nationality: applicant.nationality ?? null,
    expectedSalary: decimalToString(applicant.expectedSalary),
    currentSalary: decimalToString(applicant.currentSalary),
    educationLevel: applicant.educationLevel ?? null,
    highestDegree: applicant.highestDegree ?? null,
    skills: applicant.skills ?? [],
    status: applicant.status,
    coverLetter: applicant.coverLetter ?? null,
    sourceSnapshot: toObjectRecord(applicant.sourceSnapshot),
    customFieldValues: toObjectRecord(applicant.customFieldValues),
    appliedAt: dateToIso(applicant.appliedAt),
    shortlistedAt: dateToIso(applicant.shortlistedAt),
    interviewAt: dateToIso(applicant.interviewAt),
    offerAt: dateToIso(applicant.offerAt),
    hiredAt: dateToIso(applicant.hiredAt),
    rejectedAt: dateToIso(applicant.rejectedAt),
    lastActivityAt: dateToIso(applicant.lastActivityAt),
    profileScore:
      typeof applicant.profileScore === 'number'
        ? applicant.profileScore
        : null,
    educations: (applicant.educations ?? []).map((education: any) => ({
      id: education.id,
      institution: education.institution,
      degree: education.degree,
      field: education.field,
      startDate: dateToIso(education.startDate),
      endDate: dateToIso(education.endDate),
    })),
    experiences: (applicant.experiences ?? []).map((experience: any) => ({
      id: experience.id,
      company: experience.company,
      title: experience.title,
      startDate: dateToIso(experience.startDate),
      endDate: dateToIso(experience.endDate),
      description: experience.description ?? null,
    })),
    statusHistory: (applicant.statusHistory ?? []).map((entry: any) => ({
      id: entry.id,
      fromStatus: entry.fromStatus ?? null,
      toStatus: entry.toStatus,
      changedById: entry.changedById ?? null,
      notes: entry.notes ?? null,
      changedAt: dateToIso(entry.changedAt),
    })),
    createdAt: applicant.createdAt.toISOString(),
    updatedAt: applicant.updatedAt.toISOString(),
  };
}

export function mapInterview(interview: any) {
  const metadata = parseInterviewMetadata(interview.feedback);

  return {
    id: interview.id,
    applicantId: interview.applicantId ?? metadata.applicantId,
    type: interview.type,
    round: metadata.round,
    status: interview.status,
    scheduledAt: interview.scheduledAt?.toISOString() ?? null,
    startedAt: interview.startedAt?.toISOString() ?? null,
    completedAt: interview.completedAt?.toISOString() ?? null,
    durationMinutes:
      typeof interview.durationMinutes === 'number'
        ? interview.durationMinutes
        : null,
    interviewerId: interview.interviewerId ?? null,
    location: interview.location ?? null,
    meetingUrl: interview.meetingUrl ?? null,
    interviewers: metadata.interviewers,
    feedback: metadata.feedback,
    endorsement: metadata.endorsement,
    score: metadata.score == null ? null : String(metadata.score),
    nextAction: metadata.nextAction,
    notes: interview.notes ?? null,
    createdAt: interview.createdAt.toISOString(),
    updatedAt: interview.updatedAt.toISOString(),
  };
}

export async function touchApplicantActivity(
  prisma: Pick<PrismaService, 'applicant'>,
  applicantId: string,
  at: Date,
) {
  await prisma.applicant.update({
    where: { id: applicantId },
    data: { lastActivityAt: at },
  });
}

export function computeApplicantProfileScore(input: {
  yearsExperience: number | null;
  hasResume: boolean;
  skillsCount: number | null;
  hasLinks: boolean;
}) {
  let score = 0;

  if (input.hasResume) {
    score += 20;
  }

  const years = input.yearsExperience ?? 0;
  if (years >= 5) {
    score += 20;
  } else if (years >= 1) {
    score += 10;
  }

  const skills = input.skillsCount ?? 0;
  if (skills >= 5) {
    score += 20;
  } else if (skills >= 1) {
    score += 10;
  }

  if (input.hasLinks) {
    score += 10;
  }

  if (score > 100) score = 100;
  if (score < 0) score = 0;

  return score;
}

export async function recalculateJobMetrics(
  prisma: {
    job: PrismaService['job'];
    applicant: PrismaService['applicant'];
    interview: PrismaService['interview'];
  },
  jobId: string,
) {
  const [
    applicationsCount,
    shortlistedCount,
    offersCount,
    hiresCount,
    interviewsCount,
  ] = await Promise.all([
    prisma.applicant.count({
      where: { jobId },
    }),
    prisma.applicant.count({
      where: {
        jobId,
        status: 'SHORTLISTED',
      },
    }),
    prisma.applicant.count({
      where: {
        jobId,
        status: 'OFFER',
      },
    }),
    prisma.applicant.count({
      where: {
        jobId,
        status: 'HIRED',
      },
    }),
    prisma.interview.count({
      where: { jobId },
    }),
  ]);

  await prisma.job.update({
    where: { id: jobId },
    data: {
      applicationsCount,
      shortlistedCount,
      offersCount,
      hiresCount,
      interviewsCount,
    },
  });
}
