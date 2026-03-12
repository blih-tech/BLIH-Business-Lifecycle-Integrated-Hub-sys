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
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  APPROVAL_DECISIONS,
  APPLICATION_FORM_SECTION_TYPES,
  APPROVE_JOB_DECISIONS,
  EMPLOYMENT_TYPES,
  EXPERIENCE_LEVELS,
  JOB_APPLICANT_OPTIONAL_FIELD_KEYS,
  JOB_APPLICATION_FIELD_TYPES,
  JOB_APPLICATION_FORM_SECTIONS,
  JOB_APPROVAL_STAGES,
  JOB_CONTRACT_TYPES,
  JOB_PRIORITY_LEVELS,
  JOB_REQUEST_TYPES,
  JOB_SALARY_MODES,
  JOB_STAGE_STATUSES,
  JOB_URGENCY_LEVELS,
  JOB_WORKFLOW_STATUSES,
  WORK_LOCATION_TYPES,
} from '@repo/types';
import type {
  ApproveJobDto as ApproveJobDtoType,
  CloseJobDto as CloseJobDtoType,
  CreateJobDto as CreateJobDtoType,
  JobApplicationCustomFieldDto as JobApplicationCustomFieldDtoType,
  JobApplicationFormDto as JobApplicationFormDtoType,
  JobApplicationFormFieldDto as JobApplicationFormFieldDtoType,
  JobApplicationFormSectionDto as JobApplicationFormSectionDtoType,
  JobApprovalDto as JobApprovalDtoType,
  JobInputDto as JobInputDtoType,
  JobListQueryDto as JobListQueryDtoType,
  JobRequestFormDto as JobRequestFormDtoType,
  JobResponseDto as JobResponseDtoType,
  JobSkillsResponseDto as JobSkillsResponseDtoType,
  JobToolsResponseDto as JobToolsResponseDtoType,
  UpdateJobDto as UpdateJobDtoType,
  UpsertJobResponsibilitiesDto as UpsertJobResponsibilitiesDtoType,
  UpsertJobSkillsDto as UpsertJobSkillsDtoType,
  UpsertJobToolsDto as UpsertJobToolsDtoType,
} from '@repo/types';

const normalizeEnumValue = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') return value;
  return value
    .trim()
    .replace(/[\s-]+/g, '_')
    .toUpperCase();
};

export class JobRequestFormInputDto implements JobRequestFormDtoType {
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
  @IsUUID()
  replaceForUserId?: string | null;

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

  @ApiPropertyOptional({ enum: JOB_PRIORITY_LEVELS })
  @IsOptional()
  @Transform(normalizeEnumValue)
  @IsEnum(JOB_PRIORITY_LEVELS)
  priority?: (typeof JOB_PRIORITY_LEVELS)[number];
}

export class JobInputDto implements JobInputDtoType {
  @ApiProperty({ example: 'Senior Frontend Engineer' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: '1f31a301-dfb8-4071-aab1-ad6bc4891da7' })
  @IsUUID()
  departmentId!: string;

  @ApiProperty({ example: '8b76752b-df18-45bc-af74-1ea9a0db2e40' })
  @IsUUID()
  positionId!: string;

  @ApiProperty({
    type: 'object',
    additionalProperties: true,
    example: {
      type: 'doc',
      version: 1,
      content: [{ type: 'paragraph', text: 'Lead frontend delivery.' }],
    },
  })
  @IsObject()
  description!: Record<string, unknown>;

  @ApiPropertyOptional({
    nullable: true,
    type: 'object',
    additionalProperties: true,
    example: {
      type: 'doc',
      version: 1,
      content: [{ type: 'paragraph', text: 'Why join us summary.' }],
    },
  })
  @IsOptional()
  @IsObject()
  summary?: Record<string, unknown> | null;

  @ApiPropertyOptional({ enum: EXPERIENCE_LEVELS, nullable: true })
  @IsOptional()
  @Transform(normalizeEnumValue)
  @IsEnum(EXPERIENCE_LEVELS)
  experienceLevel?:
    | 'ENTRY'
    | 'JUNIOR'
    | 'MID'
    | 'SENIOR'
    | 'LEAD'
    | 'PRINCIPAL'
    | null;

  @ApiProperty({ enum: JOB_CONTRACT_TYPES })
  @Transform(normalizeEnumValue)
  @IsEnum(JOB_CONTRACT_TYPES)
  contractType!: 'PERMANENT' | 'CONTRACT' | 'INTERNSHIP' | 'FREELANCE';

  @ApiPropertyOptional({ enum: EMPLOYMENT_TYPES, nullable: true })
  @IsOptional()
  @Transform(normalizeEnumValue)
  @IsEnum(EMPLOYMENT_TYPES)
  employmentType?:
    | 'FULL_TIME'
    | 'PART_TIME'
    | 'CONTRACT'
    | 'INTERN'
    | 'TEMPORARY'
    | null;

  @ApiProperty({ enum: WORK_LOCATION_TYPES })
  @Transform(normalizeEnumValue)
  @IsEnum(WORK_LOCATION_TYPES)
  workLocationType!: 'ON_SITE' | 'HYBRID' | 'REMOTE';

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  city?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  country?: string | null;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  openings?: number;

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
  currency?: string | null;

  @ApiPropertyOptional({ enum: JOB_SALARY_MODES })
  @IsOptional()
  @Transform(normalizeEnumValue)
  @IsEnum(JOB_SALARY_MODES)
  salaryMode?: 'NOT_SPECIFIED' | 'FIXED' | 'NEGOTIABLE' | 'COMPETITIVE';

  @ApiPropertyOptional({ type: [String], default: [] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  benefits?: string[];

  @ApiPropertyOptional({ type: [String], default: [] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(200)
  @IsString({ each: true })
  requiredSkills?: string[];

  @ApiPropertyOptional({ type: [String], default: [] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(200)
  @IsString({ each: true })
  preferredSkills?: string[];

  @ApiPropertyOptional({ type: [String], default: [] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(200)
  @IsString({ each: true })
  responsibilities?: string[];

  @ApiPropertyOptional({ type: [String], default: [] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(200)
  @IsString({ each: true })
  tools?: string[];

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsUUID()
  hiringManagerId?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsDateString()
  applicationDeadline?: string | null;
}

export class JobApplicationCustomFieldInputDto implements JobApplicationCustomFieldDtoType {
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

export class JobApplicationFormFieldInputDto implements JobApplicationFormFieldDtoType {
  @ApiProperty({ enum: JOB_APPLICANT_OPTIONAL_FIELD_KEYS })
  @Transform(normalizeEnumValue)
  @IsEnum(JOB_APPLICANT_OPTIONAL_FIELD_KEYS)
  key!: (typeof JOB_APPLICANT_OPTIONAL_FIELD_KEYS)[number];

  @ApiProperty({ default: true })
  @IsBoolean()
  enabled!: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  required!: boolean;

  @ApiPropertyOptional({ nullable: true, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  order?: number | null;
}

export class JobApplicationFormSectionInputDto implements JobApplicationFormSectionDtoType {
  @ApiProperty({ enum: JOB_APPLICATION_FORM_SECTIONS })
  @Transform(normalizeEnumValue)
  @IsEnum(JOB_APPLICATION_FORM_SECTIONS)
  key!: (typeof JOB_APPLICATION_FORM_SECTIONS)[number];

  @ApiProperty({ default: false })
  @IsBoolean()
  enabled!: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  required!: boolean;

  @ApiPropertyOptional({ nullable: true, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  order?: number | null;
}

export class JobApplicationFormInputDto implements JobApplicationFormDtoType {
  @ApiProperty({ type: [JobApplicationFormFieldInputDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JobApplicationFormFieldInputDto)
  applicantFields!: JobApplicationFormFieldInputDto[];

  @ApiProperty({ type: [JobApplicationFormSectionInputDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JobApplicationFormSectionInputDto)
  sections!: JobApplicationFormSectionInputDto[];

  @ApiProperty({ type: [JobApplicationCustomFieldInputDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JobApplicationCustomFieldInputDto)
  customFields!: JobApplicationCustomFieldInputDto[];
}

export class CreateJobDto implements CreateJobDtoType {
  @ApiProperty({ type: JobRequestFormInputDto })
  @ValidateNested()
  @Type(() => JobRequestFormInputDto)
  requestForm!: JobRequestFormInputDto;

  @ApiProperty({ type: JobInputDto })
  @ValidateNested()
  @Type(() => JobInputDto)
  job!: JobInputDto;

  @ApiProperty({ type: JobApplicationFormInputDto })
  @ValidateNested()
  @Type(() => JobApplicationFormInputDto)
  applicationForm!: JobApplicationFormInputDto;
}

export class UpdateJobDto
  extends PartialType(CreateJobDto)
  implements UpdateJobDtoType {}

export class ApproveJobDto implements ApproveJobDtoType {
  @ApiProperty({ enum: APPROVE_JOB_DECISIONS })
  @Transform(normalizeEnumValue)
  @IsEnum(APPROVE_JOB_DECISIONS)
  decision!: 'APPROVED' | 'REJECTED';

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  comments?: string | null;
}

export class CloseJobDto implements CloseJobDtoType {
  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  reason?: string | null;
}

export class UpsertJobSkillsDto implements UpsertJobSkillsDtoType {
  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMaxSize(200)
  @IsString({ each: true })
  requiredSkills!: string[];

  @ApiPropertyOptional({ type: [String], default: [] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(200)
  @IsString({ each: true })
  preferredSkills?: string[];
}

export class UpsertJobToolsDto implements UpsertJobToolsDtoType {
  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMaxSize(200)
  @IsString({ each: true })
  tools!: string[];
}

export class UpsertJobResponsibilitiesDto implements UpsertJobResponsibilitiesDtoType {
  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMaxSize(200)
  @IsString({ each: true })
  responsibilities!: string[];
}

export class JobApprovalResponseDto implements JobApprovalDtoType {
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

export class JobToolsResponseDto implements JobToolsResponseDtoType {
  @ApiProperty({ type: [String] })
  tools!: string[];
}

export class JobSkillsResponseDto implements JobSkillsResponseDtoType {
  @ApiProperty({ type: [String] })
  requiredSkills!: string[];

  @ApiProperty({ type: [String] })
  preferredSkills!: string[];
}

export class JobResponsibilityValueResponseDto {
  @ApiProperty()
  value!: string;
}

export class JobRequestFormApprovalStatusResponseDto {
  @ApiProperty({ enum: JOB_STAGE_STATUSES })
  finance!: 'PENDING_FOR_APPROVAL' | 'APPROVED' | 'REJECTED';

  @ApiProperty({ enum: JOB_STAGE_STATUSES })
  gm!: 'PENDING_FOR_APPROVAL' | 'APPROVED' | 'REJECTED';

  @ApiProperty({ enum: JOB_STAGE_STATUSES })
  hr!: 'PENDING_FOR_APPROVAL' | 'APPROVED' | 'REJECTED';
}

export class JobRequestFormStatusResponseDto {
  @ApiProperty({ enum: JOB_WORKFLOW_STATUSES })
  workflow!:
    | 'DRAFT'
    | 'PENDING_FOR_APPROVAL'
    | 'READY_TO_POST'
    | 'PUBLISHED'
    | 'CLOSED'
    | 'REJECTED';

  @ApiProperty({ type: () => JobRequestFormApprovalStatusResponseDto })
  approvals!: JobRequestFormApprovalStatusResponseDto;
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

  @ApiPropertyOptional({ nullable: true })
  replaceForUserId!: string | null;

  @ApiProperty({ type: () => JobRequestFormStatusResponseDto })
  status!: JobRequestFormStatusResponseDto;

  @ApiProperty({ enum: JOB_PRIORITY_LEVELS })
  priority!: (typeof JOB_PRIORITY_LEVELS)[number];

  @ApiPropertyOptional({ nullable: true })
  draftedAt!: string | null;

  @ApiPropertyOptional({ nullable: true })
  pendingApprovalAt!: string | null;

  @ApiPropertyOptional({ nullable: true })
  readyToPostAt!: string | null;

  @ApiPropertyOptional({ nullable: true })
  rejectedAt!: string | null;
}

export class JobDataResponseDto extends OmitType(JobInputDto, [
  'salaryMin',
  'salaryMax',
  'applicationDeadline',
] as const) {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  slug!: string;

  @ApiPropertyOptional({
    nullable: true,
    type: 'object',
    additionalProperties: true,
  })
  summary!: Record<string, unknown> | null;

  @ApiPropertyOptional({ enum: EXPERIENCE_LEVELS, nullable: true })
  experienceLevel!:
    | 'ENTRY'
    | 'JUNIOR'
    | 'MID'
    | 'SENIOR'
    | 'LEAD'
    | 'PRINCIPAL'
    | null;

  @ApiPropertyOptional({ enum: EMPLOYMENT_TYPES, nullable: true })
  employmentType!:
    | 'FULL_TIME'
    | 'PART_TIME'
    | 'CONTRACT'
    | 'INTERN'
    | 'TEMPORARY'
    | null;

  @ApiPropertyOptional({ nullable: true })
  city!: string | null;

  @ApiPropertyOptional({ nullable: true })
  country!: string | null;

  @ApiProperty()
  openings!: number;

  @ApiPropertyOptional({ nullable: true })
  currency!: string | null;

  @ApiProperty({ enum: JOB_SALARY_MODES })
  salaryMode!: 'NOT_SPECIFIED' | 'FIXED' | 'NEGOTIABLE' | 'COMPETITIVE';

  @ApiProperty({ type: [String], default: [] })
  benefits!: string[];

  @ApiProperty({ type: [String], default: [] })
  requiredSkills!: string[];

  @ApiProperty({ type: [String], default: [] })
  preferredSkills!: string[];

  @ApiProperty({ type: [String], default: [] })
  responsibilities!: string[];

  @ApiProperty({ type: [String], default: [] })
  tools!: string[];

  @ApiPropertyOptional({ nullable: true })
  hiringManagerId!: string | null;

  @ApiProperty()
  creatorIsHr!: boolean;

  @ApiPropertyOptional({ nullable: true })
  publishedAt!: string | null;

  @ApiPropertyOptional({ nullable: true })
  closedAt!: string | null;

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

  @ApiPropertyOptional({ nullable: true })
  salaryMin!: string | null;

  @ApiPropertyOptional({ nullable: true })
  salaryMax!: string | null;

  @ApiPropertyOptional({ nullable: true })
  applicationDeadline!: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}

export class JobApplicationCustomFieldResponseDto extends OmitType(
  JobApplicationCustomFieldInputDto,
  [],
) {
  @ApiProperty()
  id!: string;

  @ApiPropertyOptional({ nullable: true })
  helpText!: string | null;

  @ApiProperty({ type: [String] })
  options!: string[];
}

export class JobApplicationFormFieldResponseDto extends OmitType(
  JobApplicationFormFieldInputDto,
  [],
) {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: 'Phone Number' })
  label!: string;

  @ApiProperty({ enum: JOB_APPLICATION_FIELD_TYPES, example: 'TEXT' })
  type!: (typeof JOB_APPLICATION_FIELD_TYPES)[number];

  @ApiPropertyOptional({ nullable: true })
  helpText!: string | null;

  @ApiProperty({ type: [String], default: [] })
  options!: string[];

  @ApiPropertyOptional({ nullable: true })
  order!: number | null;
}

export class JobApplicationFormSectionFieldResponseDto {
  @ApiProperty({ example: 'INSTITUTION' })
  key!: string;

  @ApiProperty({ example: 'Institution' })
  label!: string;

  @ApiProperty({ enum: JOB_APPLICATION_FIELD_TYPES, example: 'TEXT' })
  type!: (typeof JOB_APPLICATION_FIELD_TYPES)[number];

  @ApiProperty({ example: true })
  required!: boolean;

  @ApiPropertyOptional({ nullable: true })
  helpText!: string | null;

  @ApiProperty({ type: [String], default: [] })
  options!: string[];

  @ApiProperty({ example: 1 })
  order!: number;
}

export class JobApplicationFormSectionResponseDto extends OmitType(
  JobApplicationFormSectionInputDto,
  [],
) {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: 'Education' })
  label!: string;

  @ApiProperty({ enum: APPLICATION_FORM_SECTION_TYPES, example: 'SECTION' })
  type!: (typeof APPLICATION_FORM_SECTION_TYPES)[number];

  @ApiPropertyOptional({ nullable: true })
  helpText!: string | null;

  @ApiProperty({ type: [String], default: [] })
  options!: string[];

  @ApiProperty({
    type: [JobApplicationFormSectionFieldResponseDto],
    default: [],
  })
  fields!: JobApplicationFormSectionFieldResponseDto[];

  @ApiPropertyOptional({ nullable: true })
  order!: number | null;
}

export class JobApplicationFormResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  jobId!: string;

  @ApiProperty({ type: [JobApplicationFormFieldResponseDto] })
  applicantFields!: JobApplicationFormFieldResponseDto[];

  @ApiProperty({ type: [JobApplicationFormSectionResponseDto] })
  sections!: JobApplicationFormSectionResponseDto[];

  @ApiProperty({ type: [JobApplicationCustomFieldResponseDto] })
  customFields!: JobApplicationCustomFieldResponseDto[];
}

export class JobResponseDto implements JobResponseDtoType {
  @ApiProperty({ type: JobRequestFormResponseDto, nullable: true })
  requestForm!: JobRequestFormResponseDto | null;

  @ApiProperty({ type: JobDataResponseDto })
  job!: JobDataResponseDto;

  @ApiProperty({ type: JobApplicationFormResponseDto, nullable: true })
  applicationForm!: JobApplicationFormResponseDto | null;

  @ApiProperty({ type: [JobApprovalResponseDto] })
  approvals!: JobApprovalResponseDto[];
}

export class JobListQueryDto implements JobListQueryDtoType {
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
