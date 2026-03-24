import type {
  ApplicationFieldType,
  CustomApplicationField,
} from '@/features/hr/recruitment/requests/application-form-schema';
import { jobRequests } from '@/features/hr/recruitment/requests/mock-data';
import type {
  FullJobRequest,
  JobRequestDepartment,
} from '@/features/hr/recruitment/requests/types';

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
  requestId: string;
  title: string;
  department: JobRequestDepartment;
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
  request: FullJobRequest;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function requestIdLabel(index: number) {
  return `REQ-${String(index + 1).padStart(3, '0')}`;
}

function departmentLabel(department: JobRequestDepartment) {
  if (department === 'technical') return 'Technical';
  if (department === 'creative') return 'Creative';
  return 'Digital Marketing';
}

function workModeLabel(value: FullJobRequest['jobDetailsForm']['workMode']) {
  if (value === 'on_site') return 'On-site';
  if (value === 'hybrid') return 'Hybrid';
  return 'Remote';
}

function employmentTypeLabel(
  value: FullJobRequest['jobDetailsForm']['employmentType'],
) {
  if (value === 'FULL_TIME') return 'Full-time';
  if (value === 'PART_TIME') return 'Part-time';
  if (value === 'CONTRACT') return 'Contract';
  return 'Intern';
}

function experienceLevelLabel(
  value: FullJobRequest['jobDetailsForm']['experienceLevel'],
) {
  if (value === 'ENTRY') return 'Entry Level';
  if (value === 'MID') return 'Mid Level';
  if (value === 'SENIOR') return 'Senior Level';
  return 'Lead Level';
}

function salaryLabel(request: FullJobRequest) {
  const { salaryMin, salaryMax, currency } = request.jobDetailsForm;
  const salaryMode = request.jobDetailsForm.salaryMode as string;
  if (salaryMode === 'NEGOTIABLE') return 'Negotiable';
  if (salaryMode === 'COMPETITIVE') return 'Competitive';
  if (salaryMode === 'FIXED' && salaryMin && currency)
    return `${currency} ${salaryMin}`;
  if (salaryMode === 'COMPETITIVE' && salaryMin && salaryMax && currency) {
    return `${currency} ${salaryMin} - ${salaryMax}`;
  }
  return 'Not specified';
}

function mapCustomField(field: CustomApplicationField): CareerApplicationField {
  return {
    id: field.id,
    key: field.id,
    label: field.label,
    type: field.type,
    required: field.required,
    helpText: field.helpText,
    options: field.options.filter(Boolean),
    source: 'custom',
  };
}

function labelFromKey(key: string) {
  return key
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function applicantFieldType(key: string): ApplicationFieldType {
  if (key.includes('RESUME') || key.includes('CV')) return 'FILE';
  if (key.includes('COVER_LETTER')) return 'TEXTAREA';
  if (key.includes('EXPECTED_SALARY') || key.includes('YEARS')) return 'NUMBER';
  if (key.includes('DATE')) return 'DATE';
  return 'TEXT';
}

export function getCareerJobs(): CareerJob[] {
  return jobRequests
    .filter((request) => request.status === 'posted')
    .map((request, index) => {
      const applicationFields = [
        ...request.applicationForm.applicantFields
          .filter((field) => field.enabled)
          .map((field) => ({
            id: field.key,
            key: field.key,
            label: labelFromKey(field.key),
            type: applicantFieldType(field.key),
            required: field.required,
            options: [],
            source: 'predefined' as const,
          })),
        ...request.applicationForm.customFields.map(mapCustomField),
      ];

      return {
        slug: `${slugify(request.jobDetailsForm.title)}-${index + 1}`,
        requestId: requestIdLabel(index),
        title: request.jobDetailsForm.title,
        department: request.requestForm.department as JobRequestDepartment,
        departmentLabel: departmentLabel(
          request.requestForm.department as JobRequestDepartment,
        ),
        location: [request.jobDetailsForm.city, request.jobDetailsForm.country]
          .filter(Boolean)
          .join(', '),
        workModeLabel: workModeLabel(request.jobDetailsForm.workLocationType),
        employmentTypeLabel: employmentTypeLabel(
          request.jobDetailsForm.employmentType,
        ),
        experienceLevelLabel: experienceLevelLabel(
          request.jobDetailsForm.experienceLevel,
        ),
        summary:
          request.jobDetailsForm.summary || request.jobDetailsForm.description,
        whyJoinUs: request.jobDetailsForm.summary || undefined,
        keyResponsibilities: (request.jobDetailsForm.responsibilities ?? '')
          .split('\n')
          .map((item) => item.trim())
          .filter(Boolean),
        requirements: (request.jobDetailsForm.requiredSkills ?? '')
          .split('\n')
          .map((item) => item.trim())
          .filter(Boolean),
        preferredSkills: (request.jobDetailsForm.preferredSkills ?? '')
          .split('\n')
          .map((item) => item.trim())
          .filter(Boolean),
        benefits: (request.jobDetailsForm.benefits ?? '')
          .split('\n')
          .map((item) => item.trim())
          .filter(Boolean),
        salaryLabel: salaryLabel(request),
        applicationFields,
        request,
      };
    });
}

export function getCareerJobBySlug(slug: string) {
  return getCareerJobs().find((job) => job.slug === slug) ?? null;
}
