import { BadRequestException } from '@nestjs/common';
import type { PrismaService } from '../../../../platform/prisma/prisma.service';
import { SYSTEM_ROLES } from '../../../../shared/constants/system-roles.constant';

export const jobInclude = {
  approvals: { orderBy: { level: 'asc' as const } },
  skills: { orderBy: { order: 'asc' as const } },
  tools: { orderBy: { order: 'asc' as const } },
  responsibilities: { orderBy: { order: 'asc' as const } },
};

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
  if (status === 'PENDING_FINANCE') return 'FINANCE';
  if (status === 'PENDING_GM') return 'GM';
  if (status === 'PENDING_HR_REVIEW') return 'HR_REVIEW';
  return null;
}

export function requiredRoleForStage(stage: 'FINANCE' | 'GM' | 'HR_REVIEW') {
  if (stage === 'FINANCE') return SYSTEM_ROLES.FINANCE_MANAGER;
  if (stage === 'GM') return SYSTEM_ROLES.SUPERADMIN;
  return SYSTEM_ROLES.HR_MANAGER;
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

export function mapJob(job: any) {
  return {
    ...job,
    salaryMin: decimalToString(job.salaryMin),
    salaryMax: decimalToString(job.salaryMax),
    applicationDeadline: job.applicationDeadline?.toISOString() ?? null,
    publishedAt: job.publishedAt?.toISOString() ?? null,
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
    approvals: (job.approvals ?? []).map((approval: any) => ({
      ...approval,
      decidedAt: approval.decidedAt?.toISOString() ?? null,
      createdAt: approval.createdAt.toISOString(),
    })),
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
