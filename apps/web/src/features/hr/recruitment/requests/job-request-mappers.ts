import type { ApplicationFormValues } from '@/features/hr/recruitment/requests/application-form-schema';
import type { JobDetailsFormValues } from '@/features/hr/recruitment/requests/job-details-schema';
import type { CreateRequestFormValues } from '@/features/hr/recruitment/requests/form-schema';
import type {
  JobApprovalResponseDto,
  JobResponseDto,
} from '@/types/recruitment';
import type { ApprovalProgressState, FullJobRequest } from './types';

const fallbackApproval: { status: ApprovalProgressState } = { status: 'pending' };

function normalizeLower(value?: string | null): string {
  if (!value) return '';
  return value.toLowerCase();
}

function normalizeUpper(value?: string | null): string {
  if (!value) return '';
  return value.toUpperCase();
}

function extractRichTextText(value: unknown): string {
  if (!value || typeof value !== 'object') return '';
  const node = value as { text?: string; content?: unknown[] };
  const pieces: string[] = [];
  const walk = (item: unknown) => {
    if (!item || typeof item !== 'object') return;
    const asNode = item as { text?: string; content?: unknown[] };
    if (typeof asNode.text === 'string') pieces.push(asNode.text);
    if (Array.isArray(asNode.content)) {
      asNode.content.forEach(walk);
    }
  };
  walk(node);
  return pieces.join(' ').trim();
}

function approvalToProgress(approval?: JobApprovalResponseDto): ApprovalProgressState {
  if (!approval) return 'pending';
  if (approval.decision === 'APPROVED') return 'approved';
  if (approval.decision === 'REJECTED') return 'rejected';
  return 'pending';
}

function buildApplicationForm(
  job: JobResponseDto,
): ApplicationFormValues {
  const applicantFields =
    job.applicationForm?.applicantFields?.map((field) => ({
      key: field.key,
      enabled: field.enabled,
      required: field.required,
      order: field.order ?? undefined,
    })) ?? [];

  const sections =
    job.applicationForm?.sections?.map((section) => ({
      key: section.key,
      enabled: section.enabled,
      required: section.required,
      order: section.order ?? undefined,
    })) ?? [];

  const customFields =
    job.applicationForm?.customFields?.map((field) => ({
      id: field.id,
      label: field.label,
      type: field.type,
      required: field.required,
      helpText: field.helpText ?? undefined,
      options: field.options ?? [],
    })) ?? [];

  return {
    applicantFields,
    sections,
    customFields,
  };
}

export function mapJobResponseToRequest(
  job: JobResponseDto,
  status: FullJobRequest['status'],
): FullJobRequest {
  const requestForm: CreateRequestFormValues = {
    jobTitle: job.requestForm?.jobTitle ?? job.job.title ?? 'Untitled Job',
    department: job.requestForm?.department ?? job.job.departmentId ?? 'unknown',
    requestedBy: job.requestForm?.requestedBy ?? 'Unknown',
    position: job.job.title ?? job.requestForm?.position ?? '',
    requestType:
      normalizeLower(job.requestForm?.requestType) === 'replacement'
        ? 'REPLACEMENT'
        : 'NEW',
    replaceFor: job.requestForm?.replaceForUserId ?? '',
    businessJustification: job.requestForm?.businessJustification ?? '',
    employmentType:
      (normalizeUpper(job.requestForm?.employmentType) as CreateRequestFormValues['employmentType']) ||
      'FULL_TIME',
    workMode:
      (normalizeUpper(job.requestForm?.workMode) as CreateRequestFormValues['workMode']) ||
      'ON_SITE',
    urgency:
      (normalizeUpper(job.requestForm?.urgency) as CreateRequestFormValues['urgency']) ||
      'MEDIUM',
    neededByDate: job.requestForm?.neededByDate ?? '',
    priority:
      (normalizeUpper(job.requestForm?.priority) as CreateRequestFormValues['priority']) ||
      'MEDIUM',
  };

  const jobDetailsForm: JobDetailsFormValues = {
    title: job.job.title ?? requestForm.jobTitle,
    city: job.job.city ?? '',
    country: job.job.country ?? '',
    workLocationType:
      (normalizeUpper(job.job.workLocationType) as JobDetailsFormValues['workLocationType']) ||
      'ON_SITE',
    employmentType:
      (normalizeUpper(job.job.employmentType) as JobDetailsFormValues['employmentType']) ||
      (requestForm.employmentType as JobDetailsFormValues['employmentType']) ||
      'FULL_TIME',
    description: extractRichTextText(job.job.description),
    summary: extractRichTextText(job.job.summary),
    responsibilities: (job.job.responsibilities ?? []).join('\n'),
    requiredSkills: (job.job.requiredSkills ?? []).join('\n'),
    preferredSkills: (job.job.preferredSkills ?? []).join('\n'),
    experienceLevel:
      (normalizeUpper(job.job.experienceLevel) as JobDetailsFormValues['experienceLevel']) ||
      'MID',
    contractType:
      (normalizeUpper(job.job.contractType) as JobDetailsFormValues['contractType']) ||
      'PERMANENT',
    salaryMode:
      (normalizeUpper(job.job.salaryMode) as JobDetailsFormValues['salaryMode']) ||
      'NOT_SPECIFIED',
    salaryMin: job.job.salaryMin ?? '',
    salaryMax: job.job.salaryMax ?? '',
    currency: job.job.currency ?? '',
    benefits: (job.job.benefits ?? []).join('\n'),
    tools: (job.job.tools ?? []).join('\n'),
    hiringManagerId: job.job.hiringManagerId ?? '',
    applicationDeadline: job.job.applicationDeadline ?? '',
    openings: `${job.job.openings ?? 1}`,
  };

  const approvals = job.approvals ?? [];
  const gmApproval = approvals.find((item) => item.department === 'GM');
  const hrApproval = approvals.find((item) => item.department === 'HR');
  const financeApproval = approvals.find((item) => item.department === 'FINANCE');

  return {
    jobId: job.job.id,
    status,
    progress: {
      jm: gmApproval
        ? { status: approvalToProgress(gmApproval), justification: gmApproval.comments ?? undefined }
        : fallbackApproval,
      hr: hrApproval
        ? { status: approvalToProgress(hrApproval), justification: hrApproval.comments ?? undefined }
        : fallbackApproval,
      finance: financeApproval
        ? { status: approvalToProgress(financeApproval), justification: financeApproval.comments ?? undefined }
        : fallbackApproval,
    },
    requestForm: {
      ...requestForm,
      openings: `${job.job.openings ?? 1}`,
      createdDate: job.job.createdAt ?? '',
    } as CreateRequestFormValues & { openings?: string; createdDate?: string },
    jobDetailsForm,
    applicationForm: buildApplicationForm(job),
  };
}
