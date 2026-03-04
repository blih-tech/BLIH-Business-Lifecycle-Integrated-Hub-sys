import { BadRequestException } from '@nestjs/common';

type RequestSignals = {
  staffing?: unknown;
  schedule?: unknown;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value != null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function readNumeric(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function normalizeApprovalRole(role: string): string {
  const normalized = role
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');

  switch (normalized) {
    case 'DEPARTMENT_MANAGER':
    case 'DEPARTMENT_HEAD':
      return 'DEPARTMENT_HEAD';
    case 'FINANCE':
    case 'FINANCE_CONTROLLER':
      return 'FINANCE_CONTROLLER';
    case 'HR':
    case 'HR_MANAGER':
      return 'HR_MANAGER';
    case 'CEO':
    case 'EXECUTIVE':
    case 'EXECUTIVE_LEADERSHIP':
      return 'EXECUTIVE';
    default:
      return normalized;
  }
}

export function determineRecruitmentApprovalFlow(
  signals: RequestSignals,
): string[] {
  const staffing = asRecord(signals.staffing);
  const salaryBracket = asRecord(staffing?.salaryBracket);
  const schedule = asRecord(signals.schedule);
  const priority = String(schedule?.priority ?? '').toUpperCase();
  const salaryMax = readNumeric(salaryBracket?.max);

  const approvals = ['DEPARTMENT_HEAD', 'FINANCE_CONTROLLER'];

  if ((salaryMax ?? 0) >= 100_000 || priority === 'HIGH') {
    approvals.push('EXECUTIVE');
  }

  approvals.push('HR_MANAGER');
  return approvals;
}

export function assertNextApprovalRole(
  role: string,
  existingRoles: string[],
  requiredRoles: string[],
) {
  const normalizedRole = normalizeApprovalRole(role);
  const normalizedExistingRoles = existingRoles.map(normalizeApprovalRole);

  if (normalizedExistingRoles.includes(normalizedRole)) {
    throw new BadRequestException(
      `Approval role ${normalizedRole} has already recorded a decision`,
    );
  }

  const expectedRole = requiredRoles[normalizedExistingRoles.length];
  if (!expectedRole) {
    throw new BadRequestException(
      'Recruitment request approval workflow is already complete',
    );
  }

  if (expectedRole !== normalizedRole) {
    throw new BadRequestException(
      `Expected approval from ${expectedRole} before ${normalizedRole}`,
    );
  }

  return normalizedRole;
}
