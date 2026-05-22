import { apiClient } from '@/lib/api-client';
import type { JobResponseDto } from '@repo/types/recruitment/jobs';
import type { ApplicationFieldType } from '@/features/hr/recruitment/requests/application-form-schema';

export type CareerApplicationField = {
  id: string;
  key: string;
  label: string;
  type: ApplicationFieldType;
  required: boolean;
  helpText?: string;
  options: string[];
  source: 'predefined' | 'custom';
};

export type CareerJob = {
  slug: string;
  id: string;
  requestId: string;
  title: string;
  department: string;
  departmentLabel: string;
  location: string;
  workModeLabel: string;
  employmentTypeLabel: string;
  experienceLevelLabel: string;
  summary: string;
  whyJoinUs?: string;
  keyResponsibilities: string[];
  requirements: string[];
  preferredSkills: string[];
  benefits: string[];
  salaryLabel: string;
  applicationFields: CareerApplicationField[];
};

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

function mapApiJobToCareerJob(apiJob: JobResponseDto): CareerJob {
  const { job, applicationForm } = apiJob;

  const applicationFields: CareerApplicationField[] = [];
  const applicantFields = applicationForm?.applicantFields ?? [];
  const customFields = applicationForm?.customFields ?? [];

  for (const field of applicantFields) {
    if (!field.enabled) continue;
    applicationFields.push({
      id: field.id,
      key: field.key,
      label: field.label ?? field.key,
      type: (field.type ?? 'TEXT') as ApplicationFieldType,
      required: field.required,
      helpText: field.helpText ?? undefined,
      options: field.options ?? [],
      source: 'predefined',
    });
  }

  for (const field of customFields) {
    applicationFields.push({
      id: field.id,
      key: field.id,
      label: field.label,
      type: field.type as ApplicationFieldType,
      required: field.required,
      helpText: field.helpText ?? undefined,
      options: field.options ?? [],
      source: 'custom',
    });
  }

  if (applicationFields.length === 0) {
    // Helpful for debugging missing form config.

    console.warn('Career job has no application fields', {
      slug: job.slug,
      jobId: job.id,
      hasApplicationForm: Boolean(applicationForm),
      applicantFieldsCount: applicantFields.length,
      customFieldsCount: customFields.length,
    });
  }

  return {
    slug: job.slug,
    id: job.id,
    requestId: apiJob.requestForm?.id ?? job.id.slice(0, 8).toUpperCase(),
    title: job.title,
    department: job.departmentId,
    departmentLabel: job.departmentId, // In a real app, this might be a name from a join, but JobResponseDto returns IDs currently or we need to map them
    location: [job.city, job.country].filter(Boolean).join(', ') || 'Remote',
    workModeLabel: job.workLocationType.toLowerCase().replace('_', ' '),
    employmentTypeLabel:
      job.employmentType?.toLowerCase().replace('_', ' ') || 'Full-time',
    experienceLevelLabel: job.experienceLevel?.toLowerCase() || 'Entry',
    summary: extractRichTextText(job.summary || job.description),
    whyJoinUs: extractRichTextText(job.summary),
    keyResponsibilities: job.responsibilities,
    requirements: job.requiredSkills,
    preferredSkills: job.preferredSkills,
    benefits: job.benefits,
    salaryLabel:
      job.salaryMode === 'NEGOTIABLE'
        ? 'Negotiable'
        : job.salaryMode === 'COMPETITIVE'
          ? 'Competitive'
          : job.salaryMin && job.salaryMax
            ? `${job.currency} ${job.salaryMin} - ${job.salaryMax}`
            : job.salaryMin
              ? `${job.currency} ${job.salaryMin}`
              : 'Not specified',
    applicationFields,
  };
}

export async function getCareerJobs(): Promise<CareerJob[]> {
  try {
    const response = await apiClient.get<{
      success: boolean;
      message: string;
      data: JobResponseDto[] | null;
    }>('hr/recruitment/jobs/public');
    return (response.data ?? []).map(mapApiJobToCareerJob);
  } catch (error) {
    console.error('Failed to fetch public jobs:', error);
    return [];
  }
}

export async function getCareerJobBySlug(
  slug: string,
): Promise<CareerJob | null> {
  try {
    const response = await apiClient.get<{
      success: boolean;
      message: string;
      data: JobResponseDto | null;
    }>(`hr/recruitment/jobs/public/${slug}`);
    return response.data ? mapApiJobToCareerJob(response.data) : null;
  } catch (error) {
    console.error(`Failed to fetch public job by slug ${slug}:`, error);
    return null;
  }
}
