import type {
  ApplicationFieldType,
  CustomApplicationField,
  PredefinedApplicationField,
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
  if (value === 'full_time') return 'Full-time';
  if (value === 'part_time') return 'Part-time';
  if (value === 'contract') return 'Contract';
  return 'Intern';
}

function experienceLevelLabel(
  value: FullJobRequest['jobDetailsForm']['experienceLevel'],
) {
  if (value === 'entry') return 'Entry Level';
  if (value === 'mid') return 'Mid Level';
  if (value === 'senior') return 'Senior Level';
  return 'Lead Level';
}

function salaryLabel(request: FullJobRequest) {
  const { salaryMode, salaryRangeMin, salaryRangeMax, salaryCurrency } =
    request.jobDetailsForm;
  if (salaryMode === 'negotiable') return 'Negotiable';
  if (salaryMode === 'competitive') return 'Competitive';
  if (salaryMode === 'range')
    return `${salaryCurrency} ${salaryRangeMin} - ${salaryRangeMax}`;
  return 'Not specified';
}

function mapPredefinedField(
  field: PredefinedApplicationField,
): CareerApplicationField {
  return {
    id: field.key,
    key: field.key,
    label: field.label,
    type: field.type,
    required: field.required,
    options: [],
    source: 'predefined',
  };
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

export function getCareerJobs(): CareerJob[] {
  return jobRequests
    .filter((request) => request.status === 'posted')
    .map((request, index) => {
      const applicationFields = [
        ...request.applicationForm.predefinedFields
          .filter((field) => field.enabled)
          .map(mapPredefinedField),
        ...request.applicationForm.customFields.map(mapCustomField),
      ];

      return {
        slug: `${slugify(request.jobDetailsForm.jobTitle)}-${index + 1}`,
        requestId: requestIdLabel(index),
        title: request.jobDetailsForm.jobTitle,
        department: request.requestForm.department as JobRequestDepartment,
        departmentLabel: departmentLabel(
          request.requestForm.department as JobRequestDepartment,
        ),
        location: request.jobDetailsForm.location,
        workModeLabel: workModeLabel(request.jobDetailsForm.workMode),
        employmentTypeLabel: employmentTypeLabel(
          request.jobDetailsForm.employmentType,
        ),
        experienceLevelLabel: experienceLevelLabel(
          request.jobDetailsForm.experienceLevel,
        ),
        summary: request.jobDetailsForm.jobSummary,
        whyJoinUs: request.jobDetailsForm.whyJoinUs || undefined,
        keyResponsibilities: request.jobDetailsForm.keyResponsibilities,
        requirements: request.jobDetailsForm.requirements,
        preferredSkills: request.jobDetailsForm.preferredSkills,
        benefits: request.jobDetailsForm.benefits,
        salaryLabel: salaryLabel(request),
        applicationFields,
        request,
      };
    });
}

export function getCareerJobBySlug(slug: string) {
  return getCareerJobs().find((job) => job.slug === slug) ?? null;
}
