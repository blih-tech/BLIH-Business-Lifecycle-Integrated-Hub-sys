import { PartialType } from '@nestjs/swagger';
import {
  ApiProperty,
  ApiPropertyOptional,
  OmitType,
  PickType,
} from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

const APPROVAL_DECISIONS = ['PENDING', 'APPROVED', 'REJECTED'] as const;
const EMPLOYMENT_TYPES = [
  'FULL_TIME',
  'PART_TIME',
  'CONTRACT',
  'INTERN',
  'TEMPORARY',
] as const;
const EXPERIENCE_LEVELS = [
  'ENTRY',
  'JUNIOR',
  'MID',
  'SENIOR',
  'LEAD',
  'PRINCIPAL',
] as const;
const JOB_APPROVAL_STAGES = ['FINANCE', 'GM', 'HR_REVIEW'] as const;
const JOB_APPLICATION_FIELD_TYPES = [
  'TEXT',
  'TEXTAREA',
  'NUMBER',
  'SELECT',
  'FILE',
  'DATE',
  'CHECKBOX',
] as const;
const JOB_PREDEFINED_FIELD_KEYS = [
  'FULL_NAME',
  'EMAIL',
  'PHONE',
  'RESUME',
  'COVER_LETTER',
  'LINKEDIN',
  'PORTFOLIO',
  'GITHUB',
  'CURRENT_COMPANY',
  'CURRENT_POSITION',
  'YEARS_EXPERIENCE',
] as const;
const JOB_REQUEST_TYPES = ['NEW', 'REPLACEMENT'] as const;
const JOB_STAGE_STATUSES = [
  'PENDING_FOR_APPROVAL',
  'APPROVED',
  'REJECTED',
] as const;
const JOB_URGENCY_LEVELS = ['HIGH', 'MEDIUM', 'LOW'] as const;
const JOB_WORKFLOW_STATUSES = [
  'DRAFT',
  'PENDING_FOR_APPROVAL',
  'READY_TO_POST',
  'PUBLISHED',
  'CLOSED',
  'REJECTED',
] as const;
const JOB_PRIORITY_LEVELS = ['HIGH', 'MEDIUM', 'LOW'] as const;
const SALARY_MODES = ['NOT_SPECIFIED', 'NEGOTIABLE', 'COMPETITIVE'] as const;
const SKILL_LEVELS = [
  'BEGINNER',
  'INTERMEDIATE',
  'ADVANCED',
  'EXPERT',
] as const;
const WORK_LOCATION_TYPES = ['ON_SITE', 'HYBRID', 'REMOTE'] as const;

const normalizeEnumValue = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') return value;
  return value
    .trim()
    .replace(/[\s-]+/g, '_')
    .toUpperCase();
};

const normalizePredefinedKey = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  const snake = trimmed
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toUpperCase();
  return snake;
};

export class JobSkillInputDto {
  @ApiProperty({ example: 'TypeScript' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ enum: SKILL_LEVELS })
  @IsOptional()
  @Transform(normalizeEnumValue)
  @IsEnum(SKILL_LEVELS)
  level?: (typeof SKILL_LEVELS)[number] | null;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  order?: number | null;
}

export class JobToolInputDto {
  @ApiProperty({ example: 'PostgreSQL' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  order?: number | null;
}

export class JobResponsibilityInputDto {
  @ApiProperty({ example: 'Design and maintain backend services.' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  order?: number | null;
}

export class JobRequestFormInputDto {
  @ApiProperty({ example: 'Senior Frontend Engineer' })
  @IsString()
  @IsNotEmpty()
  jobTitle!: string;

  @ApiProperty({ example: '1f31a301-dfb8-4071-aab1-ad6bc4891da7' })
  @IsUUID()
  department!: string;

  @ApiProperty({ example: 'Alice Njeri' })
  @IsString()
  @IsNotEmpty()
  requestedBy!: string;

  @ApiProperty({ example: '8b76752b-df18-45bc-af74-1ea9a0db2e40' })
  @IsUUID()
  position!: string;

  @ApiProperty({ enum: JOB_REQUEST_TYPES })
  @Transform(normalizeEnumValue)
  @IsEnum(JOB_REQUEST_TYPES)
  requestType!: 'NEW' | 'REPLACEMENT';

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  replaceFor?: string | null;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  businessJustification!: string;

  @ApiProperty({ enum: EMPLOYMENT_TYPES })
  @Transform(normalizeEnumValue)
  @IsEnum(EMPLOYMENT_TYPES)
  employmentType!:
    | 'FULL_TIME'
    | 'PART_TIME'
    | 'CONTRACT'
    | 'INTERN'
    | 'TEMPORARY';

  @ApiProperty({ enum: WORK_LOCATION_TYPES })
  @Transform(normalizeEnumValue)
  @IsEnum(WORK_LOCATION_TYPES)
  workMode!: 'ON_SITE' | 'HYBRID' | 'REMOTE';

  @ApiProperty({ enum: JOB_URGENCY_LEVELS })
  @Transform(normalizeEnumValue)
  @IsEnum(JOB_URGENCY_LEVELS)
  urgency!: 'HIGH' | 'MEDIUM' | 'LOW';

  @ApiProperty()
  @IsDateString()
  neededByDate!: string;
}

export class JobDetailsFormInputDto {
  @ApiProperty({ example: 'Senior Frontend Engineer' })
  @IsString()
  @IsNotEmpty()
  jobTitle!: string;

  @ApiProperty({ example: 'Addis Ababa, Ethiopia' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  location!: string;

  @ApiProperty({ enum: WORK_LOCATION_TYPES })
  @Transform(normalizeEnumValue)
  @IsEnum(WORK_LOCATION_TYPES)
  workMode!: 'ON_SITE' | 'HYBRID' | 'REMOTE';

  @ApiProperty({ enum: EMPLOYMENT_TYPES })
  @Transform(normalizeEnumValue)
  @IsEnum(EMPLOYMENT_TYPES)
  employmentType!:
    | 'FULL_TIME'
    | 'PART_TIME'
    | 'CONTRACT'
    | 'INTERN'
    | 'TEMPORARY';

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  jobSummary!: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  whyJoinUs?: string | null;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  keyResponsibilities!: string;

  @ApiProperty({ type: [JobSkillInputDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JobSkillInputDto)
  skills!: JobSkillInputDto[];

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  preferredSkills?: string | null;

  @ApiProperty({ enum: EXPERIENCE_LEVELS })
  @Transform(normalizeEnumValue)
  @IsEnum(EXPERIENCE_LEVELS)
  experienceLevel!:
    | 'ENTRY'
    | 'JUNIOR'
    | 'MID'
    | 'SENIOR'
    | 'LEAD'
    | 'PRINCIPAL';

  @ApiPropertyOptional({ nullable: true, example: 2000 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  salaryMin?: number | null;

  @ApiPropertyOptional({ nullable: true, example: 3000 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  salaryMax?: number | null;

  @ApiPropertyOptional({ nullable: true, example: 'USD' })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-z]{3}$/)
  salaryCurrency?: string | null;

  @ApiProperty({ enum: SALARY_MODES })
  @Transform(normalizeEnumValue)
  @IsEnum(SALARY_MODES)
  salaryMode!: 'NOT_SPECIFIED' | 'NEGOTIABLE' | 'COMPETITIVE';

  @ApiPropertyOptional({ type: [String], default: [] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  benefits?: string[];

  @ApiProperty({ default: 1, minimum: 1 })
  @IsInt()
  @Min(1)
  openings!: number;

  @ApiProperty()
  @IsDateString()
  applicationDeadline!: string;
}

export class JobApplicationPredefinedFieldInputDto {
  @ApiProperty({
    enum: [
      'fullName',
      'email',
      'phone',
      'resume',
      'coverLetter',
      'linkedin',
      'portfolio',
      'github',
      'currentCompany',
      'currentPosition',
      'yearsExperience',
    ],
  })
  @Transform(normalizePredefinedKey)
  @IsEnum(JOB_PREDEFINED_FIELD_KEYS)
  key!: (typeof JOB_PREDEFINED_FIELD_KEYS)[number];

  @ApiProperty()
  @IsBoolean()
  enabled!: boolean;

  @ApiProperty()
  @IsBoolean()
  required!: boolean;
}

export class JobApplicationCustomFieldInputDto {
  @ApiProperty({ example: 'custom-123' })
  @IsString()
  @IsNotEmpty()
  id!: string;

  @ApiProperty({ example: 'Portfolio URL' })
  @IsString()
  @IsNotEmpty()
  label!: string;

  @ApiProperty({ enum: JOB_APPLICATION_FIELD_TYPES })
  @Transform(normalizeEnumValue)
  @IsEnum(JOB_APPLICATION_FIELD_TYPES)
  type!:
    | 'TEXT'
    | 'TEXTAREA'
    | 'NUMBER'
    | 'SELECT'
    | 'FILE'
    | 'DATE'
    | 'CHECKBOX';

  @ApiProperty()
  @IsBoolean()
  required!: boolean;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  helpText?: string | null;

  @ApiPropertyOptional({ type: [String], default: [] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];
}

export class JobApplicationFormInputDto {
  @ApiProperty({ type: [JobApplicationPredefinedFieldInputDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JobApplicationPredefinedFieldInputDto)
  predefinedFields!: JobApplicationPredefinedFieldInputDto[];

  @ApiProperty({ type: [JobApplicationCustomFieldInputDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JobApplicationCustomFieldInputDto)
  customFields!: JobApplicationCustomFieldInputDto[];
}

export class CreateJobDto {
  @ApiProperty({ type: JobRequestFormInputDto })
  @ValidateNested()
  @Type(() => JobRequestFormInputDto)
  requestForm!: JobRequestFormInputDto;

  @ApiProperty({ type: JobDetailsFormInputDto })
  @ValidateNested()
  @Type(() => JobDetailsFormInputDto)
  jobDetailsForm!: JobDetailsFormInputDto;

  @ApiProperty({ type: JobApplicationFormInputDto })
  @ValidateNested()
  @Type(() => JobApplicationFormInputDto)
  applicationForm!: JobApplicationFormInputDto;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsUUID()
  hiringManagerId?: string | null;

  @ApiPropertyOptional({ enum: JOB_PRIORITY_LEVELS })
  @IsOptional()
  @Transform(normalizeEnumValue)
  @IsEnum(JOB_PRIORITY_LEVELS)
  priority?: (typeof JOB_PRIORITY_LEVELS)[number];
}

export class UpdateJobDto extends PartialType(CreateJobDto) {}

export class ApproveJobDto {
  @ApiProperty({ enum: ['APPROVED', 'REJECTED'] })
  @Transform(normalizeEnumValue)
  @IsEnum(['APPROVED', 'REJECTED'])
  decision!: 'APPROVED' | 'REJECTED';

  @ApiPropertyOptional({ enum: JOB_APPROVAL_STAGES, nullable: true })
  @IsOptional()
  @Transform(normalizeEnumValue)
  @IsEnum(JOB_APPROVAL_STAGES)
  stage?: 'FINANCE' | 'GM' | 'HR_REVIEW' | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  comments?: string | null;
}

export class CloseJobDto {
  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  reason?: string | null;
}

export class UpsertJobSkillsDto {
  @ApiProperty({ type: [JobSkillInputDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JobSkillInputDto)
  skills!: JobSkillInputDto[];
}

export class UpsertJobToolsDto {
  @ApiProperty({ type: [JobToolInputDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JobToolInputDto)
  tools!: JobToolInputDto[];
}

export class UpsertJobResponsibilitiesDto {
  @ApiProperty({ type: [JobResponsibilityInputDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JobResponsibilityInputDto)
  responsibilities!: JobResponsibilityInputDto[];
}

export class JobApprovalResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: JOB_APPROVAL_STAGES })
  stage!: 'FINANCE' | 'GM' | 'HR_REVIEW';

  @ApiProperty()
  level!: number;

  @ApiProperty()
  requiredRole!: string;

  @ApiPropertyOptional({ nullable: true })
  approverId!: string | null;

  @ApiProperty({ enum: APPROVAL_DECISIONS })
  decision!: 'PENDING' | 'APPROVED' | 'REJECTED';

  @ApiProperty()
  autoApproved!: boolean;

  @ApiPropertyOptional({ nullable: true })
  autoApprovalReason!: string | null;

  @ApiPropertyOptional({ nullable: true })
  comments!: string | null;

  @ApiPropertyOptional({ nullable: true })
  decidedAt!: string | null;

  @ApiProperty()
  createdAt!: string;
}

export class JobSkillResponseDto extends OmitType(JobSkillInputDto, []) {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  required!: boolean;

  @ApiPropertyOptional({ nullable: true })
  order!: number | null;
}

export class JobToolResponseDto extends OmitType(JobToolInputDto, []) {
  @ApiProperty()
  id!: string;
}

export class JobResponsibilityResponseDto extends OmitType(
  JobResponsibilityInputDto,
  [],
) {
  @ApiProperty()
  id!: string;
}

export class JobRequestFormResponseDto extends OmitType(
  JobRequestFormInputDto,
  [],
) {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  department!: string;

  @ApiProperty()
  position!: string;
}

export class JobDetailsFormResponseDto extends OmitType(
  JobDetailsFormInputDto,
  ['salaryMin', 'salaryMax'] as const,
) {
  @ApiProperty()
  id!: string;

  @ApiPropertyOptional({ nullable: true })
  salaryMin!: string | null;

  @ApiPropertyOptional({ nullable: true })
  salaryMax!: string | null;

  @ApiPropertyOptional({ nullable: true })
  salaryCurrency!: string | null;
}

export class JobApplicationPredefinedFieldResponseDto extends OmitType(
  JobApplicationPredefinedFieldInputDto,
  [],
) {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  label!: string;

  @ApiProperty({ enum: JOB_APPLICATION_FIELD_TYPES })
  type!:
    | 'TEXT'
    | 'TEXTAREA'
    | 'NUMBER'
    | 'SELECT'
    | 'FILE'
    | 'DATE'
    | 'CHECKBOX';
}

export class JobApplicationCustomFieldResponseDto extends OmitType(
  JobApplicationCustomFieldInputDto,
  [],
) {
  @ApiProperty()
  id!: string;

  @ApiProperty({ type: [String] })
  options!: string[];
}

export class JobApplicationFormResponseDto extends OmitType(
  JobApplicationFormInputDto,
  [],
) {
  @ApiProperty()
  id!: string;
}

export class JobResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty({ enum: JOB_WORKFLOW_STATUSES })
  status!:
    | 'DRAFT'
    | 'PENDING_FOR_APPROVAL'
    | 'READY_TO_POST'
    | 'PUBLISHED'
    | 'CLOSED'
    | 'REJECTED';

  @ApiProperty({ enum: JOB_STAGE_STATUSES })
  financeApprovalStatus!: 'PENDING_FOR_APPROVAL' | 'APPROVED' | 'REJECTED';

  @ApiProperty({ enum: JOB_STAGE_STATUSES })
  gmApprovalStatus!: 'PENDING_FOR_APPROVAL' | 'APPROVED' | 'REJECTED';

  @ApiProperty({ enum: JOB_STAGE_STATUSES })
  hrApprovalStatus!: 'PENDING_FOR_APPROVAL' | 'APPROVED' | 'REJECTED';

  @ApiProperty()
  creatorIsHr!: boolean;

  @ApiPropertyOptional({ enum: JOB_PRIORITY_LEVELS, nullable: true })
  priority!: (typeof JOB_PRIORITY_LEVELS)[number] | null;

  @ApiPropertyOptional({ nullable: true })
  hiringManagerId!: string | null;

  @ApiPropertyOptional({ nullable: true })
  draftedAt!: string | null;

  @ApiPropertyOptional({ nullable: true })
  pendingApprovalAt!: string | null;

  @ApiPropertyOptional({ nullable: true })
  readyToPostAt!: string | null;

  @ApiPropertyOptional({ nullable: true })
  publishedAt!: string | null;

  @ApiPropertyOptional({ nullable: true })
  closedAt!: string | null;

  @ApiPropertyOptional({ nullable: true })
  rejectedAt!: string | null;

  @ApiPropertyOptional({ nullable: true })
  closingReason!: string | null;

  @ApiProperty()
  viewsCount!: number;

  @ApiProperty()
  applicationsCount!: number;

  @ApiProperty()
  shortlistedCount!: number;

  @ApiProperty()
  interviewsCount!: number;

  @ApiProperty()
  offersCount!: number;

  @ApiProperty()
  hiresCount!: number;

  @ApiPropertyOptional({ nullable: true })
  createdById!: string | null;

  @ApiProperty({ type: JobRequestFormResponseDto })
  requestForm!: JobRequestFormResponseDto;

  @ApiProperty({ type: JobDetailsFormResponseDto })
  jobDetailsForm!: JobDetailsFormResponseDto;

  @ApiProperty({ type: JobApplicationFormResponseDto })
  applicationForm!: JobApplicationFormResponseDto;

  @ApiProperty({ type: [JobApprovalResponseDto] })
  approvals!: JobApprovalResponseDto[];

  @ApiProperty({ type: [JobSkillResponseDto] })
  skills!: JobSkillResponseDto[];

  @ApiProperty({ type: [JobToolResponseDto] })
  tools!: JobToolResponseDto[];

  @ApiProperty({ type: [JobResponsibilityResponseDto] })
  responsibilities!: JobResponsibilityResponseDto[];

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}

export class JobListQueryDto {
  @ApiPropertyOptional({ enum: JOB_WORKFLOW_STATUSES })
  @IsOptional()
  @Transform(normalizeEnumValue)
  @IsEnum(JOB_WORKFLOW_STATUSES)
  status?:
    | 'DRAFT'
    | 'PENDING_FOR_APPROVAL'
    | 'READY_TO_POST'
    | 'PUBLISHED'
    | 'CLOSED'
    | 'REJECTED';

  @ApiPropertyOptional({ enum: JOB_STAGE_STATUSES })
  @IsOptional()
  @Transform(normalizeEnumValue)
  @IsEnum(JOB_STAGE_STATUSES)
  financeApprovalStatus?: 'PENDING_FOR_APPROVAL' | 'APPROVED' | 'REJECTED';

  @ApiPropertyOptional({ enum: JOB_STAGE_STATUSES })
  @IsOptional()
  @Transform(normalizeEnumValue)
  @IsEnum(JOB_STAGE_STATUSES)
  gmApprovalStatus?: 'PENDING_FOR_APPROVAL' | 'APPROVED' | 'REJECTED';

  @ApiPropertyOptional({ enum: JOB_STAGE_STATUSES })
  @IsOptional()
  @Transform(normalizeEnumValue)
  @IsEnum(JOB_STAGE_STATUSES)
  hrApprovalStatus?: 'PENDING_FOR_APPROVAL' | 'APPROVED' | 'REJECTED';

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  departmentId?: string;
}

export class JobIdParamDto extends PickType(CreateJobDto, [] as const) {
  @ApiProperty({ example: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374' })
  @IsUUID()
  id!: string;
}
