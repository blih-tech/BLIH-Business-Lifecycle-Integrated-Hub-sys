import { PartialType } from '@nestjs/swagger';
import {
  ApiProperty,
  ApiPropertyOptional,
  OmitType,
  PickType,
} from '@nestjs/swagger';
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
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export const EXPERIENCE_LEVELS = [
  'ENTRY',
  'JUNIOR',
  'MID',
  'SENIOR',
  'LEAD',
  'PRINCIPAL',
] as const;

export const JOB_CONTRACT_TYPES = [
  'PERMANENT',
  'CONTRACT',
  'INTERNSHIP',
  'FREELANCE',
] as const;

export const EMPLOYMENT_TYPES = [
  'FULL_TIME',
  'PART_TIME',
  'CONTRACT',
  'INTERN',
  'TEMPORARY',
] as const;

export const WORK_LOCATION_TYPES = ['ON_SITE', 'HYBRID', 'REMOTE'] as const;

export const REMOTE_SCOPES = ['CITY', 'COUNTRY', 'REGION', 'GLOBAL'] as const;

export const JOB_WORKFLOW_STATUSES = [
  'DRAFT',
  'PENDING_FINANCE',
  'PENDING_GM',
  'PENDING_HR_REVIEW',
  'APPROVED',
  'PUBLISHED',
  'CLOSED',
  'REJECTED',
  'CANCELLED',
] as const;

export const JOB_APPROVAL_STAGES = ['FINANCE', 'GM', 'HR_REVIEW'] as const;
export const APPROVAL_DECISIONS = ['PENDING', 'APPROVED', 'REJECTED'] as const;

export class JobSkillInputDto {
  @ApiProperty({ example: 'TypeScript' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({
    enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'],
  })
  @IsOptional()
  @IsEnum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'])
  level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT' | null;

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

export class CreateJobDto {
  @ApiProperty({ example: 'Senior Backend Engineer' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({
    example: '1f31a301-dfb8-4071-aab1-ad6bc4891da7',
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  departmentId?: string | null;

  @ApiPropertyOptional({
    example: '8b76752b-df18-45bc-af74-1ea9a0db2e40',
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  positionId?: string | null;

  @ApiProperty({ example: 'Lead backend architecture and delivery.' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  summary?: string | null;

  @ApiPropertyOptional({ enum: EXPERIENCE_LEVELS, nullable: true })
  @IsOptional()
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
  @IsEnum(JOB_CONTRACT_TYPES)
  contractType!: 'PERMANENT' | 'CONTRACT' | 'INTERNSHIP' | 'FREELANCE';

  @ApiPropertyOptional({ enum: EMPLOYMENT_TYPES, nullable: true })
  @IsOptional()
  @IsEnum(EMPLOYMENT_TYPES)
  employmentType?:
    | 'FULL_TIME'
    | 'PART_TIME'
    | 'CONTRACT'
    | 'INTERN'
    | 'TEMPORARY'
    | null;

  @ApiProperty({ enum: WORK_LOCATION_TYPES })
  @IsEnum(WORK_LOCATION_TYPES)
  workLocationType!: 'ON_SITE' | 'HYBRID' | 'REMOTE';

  @ApiPropertyOptional({ enum: REMOTE_SCOPES, nullable: true })
  @IsOptional()
  @IsEnum(REMOTE_SCOPES)
  remoteScope?: 'CITY' | 'COUNTRY' | 'REGION' | 'GLOBAL' | null;

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

  @ApiPropertyOptional({ nullable: true, example: 100000 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  salaryMin?: number | null;

  @ApiPropertyOptional({ nullable: true, example: 180000 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  salaryMax?: number | null;

  @ApiPropertyOptional({ nullable: true, example: 'USD' })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{3}$/)
  currency?: string | null;

  @ApiPropertyOptional({ type: [String], default: [] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  benefits?: string[];

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsDateString()
  applicationDeadline?: string | null;
}

export class UpdateJobDto extends PartialType(CreateJobDto) {}

export class ApproveJobDto {
  @ApiProperty({ enum: ['APPROVED', 'REJECTED'] })
  @IsEnum(['APPROVED', 'REJECTED'])
  decision!: 'APPROVED' | 'REJECTED';

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

export class JobResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  slug!: string;

  @ApiPropertyOptional({ nullable: true })
  departmentId!: string | null;

  @ApiPropertyOptional({ nullable: true })
  positionId!: string | null;

  @ApiProperty()
  description!: string;

  @ApiPropertyOptional({ nullable: true })
  summary!: string | null;

  @ApiPropertyOptional({ enum: EXPERIENCE_LEVELS, nullable: true })
  experienceLevel!:
    | 'ENTRY'
    | 'JUNIOR'
    | 'MID'
    | 'SENIOR'
    | 'LEAD'
    | 'PRINCIPAL'
    | null;

  @ApiProperty({ enum: JOB_CONTRACT_TYPES })
  contractType!: 'PERMANENT' | 'CONTRACT' | 'INTERNSHIP' | 'FREELANCE';

  @ApiPropertyOptional({ enum: EMPLOYMENT_TYPES, nullable: true })
  employmentType!:
    | 'FULL_TIME'
    | 'PART_TIME'
    | 'CONTRACT'
    | 'INTERN'
    | 'TEMPORARY'
    | null;

  @ApiProperty({ enum: WORK_LOCATION_TYPES })
  workLocationType!: 'ON_SITE' | 'HYBRID' | 'REMOTE';

  @ApiPropertyOptional({ enum: REMOTE_SCOPES, nullable: true })
  remoteScope!: 'CITY' | 'COUNTRY' | 'REGION' | 'GLOBAL' | null;

  @ApiPropertyOptional({ nullable: true })
  city!: string | null;

  @ApiPropertyOptional({ nullable: true })
  country!: string | null;

  @ApiProperty()
  openings!: number;

  @ApiPropertyOptional({ nullable: true })
  salaryMin!: string | null;

  @ApiPropertyOptional({ nullable: true })
  salaryMax!: string | null;

  @ApiPropertyOptional({ nullable: true })
  currency!: string | null;

  @ApiProperty({ type: [String] })
  benefits!: string[];

  @ApiProperty({ enum: JOB_WORKFLOW_STATUSES })
  status!:
    | 'DRAFT'
    | 'PENDING_FINANCE'
    | 'PENDING_GM'
    | 'PENDING_HR_REVIEW'
    | 'APPROVED'
    | 'PUBLISHED'
    | 'CLOSED'
    | 'REJECTED'
    | 'CANCELLED';

  @ApiProperty()
  creatorIsHr!: boolean;

  @ApiPropertyOptional({ nullable: true })
  applicationDeadline!: string | null;

  @ApiPropertyOptional({ nullable: true })
  publishedAt!: string | null;

  @ApiPropertyOptional({ nullable: true })
  createdById!: string | null;

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
  @IsEnum(JOB_WORKFLOW_STATUSES)
  status?:
    | 'DRAFT'
    | 'PENDING_FINANCE'
    | 'PENDING_GM'
    | 'PENDING_HR_REVIEW'
    | 'APPROVED'
    | 'PUBLISHED'
    | 'CLOSED'
    | 'REJECTED'
    | 'CANCELLED';

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
