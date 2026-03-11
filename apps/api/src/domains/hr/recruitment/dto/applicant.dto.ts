import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

const APPLICANT_STATUSES = [
  'APPLIED',
  'SCREENING',
  'SHORTLISTED',
  'INTERVIEW',
  'WAITLIST',
  'OFFER',
  'HIRED',
  'REJECTED',
  'WITHDRAWN',
] as const;

const CANDIDATE_SOURCES = [
  'COMPANY_SITE',
  'LINKEDIN',
  'TELEGRAM',
  'REFERRAL',
  'AGENCY',
] as const;

const normalizeEnumValue = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') return value;
  return value
    .trim()
    .replace(/[\s-]+/g, '_')
    .toUpperCase();
};

export class ApplicantEducationInputDto {
  @ApiProperty({ example: 'Addis Ababa University' })
  @IsString()
  @IsNotEmpty()
  institution!: string;

  @ApiProperty({ example: 'BSc' })
  @IsString()
  @IsNotEmpty()
  degree!: string;

  @ApiProperty({ example: 'Computer Science' })
  @IsString()
  @IsNotEmpty()
  field!: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsDateString()
  startDate?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsDateString()
  endDate?: string | null;
}

export class ApplicantExperienceInputDto {
  @ApiProperty({ example: 'TechCorp' })
  @IsString()
  @IsNotEmpty()
  company!: string;

  @ApiProperty({ example: 'Senior Engineer' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsDateString()
  startDate?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsDateString()
  endDate?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string | null;
}

export class CreateApplicantDto {
  @ApiProperty({ example: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374' })
  @IsUUID()
  jobId!: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsUUID()
  applicationFormId?: string | null;

  @ApiProperty({ example: 'Abel' })
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({ example: 'Tesfaye' })
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ApiProperty({ example: 'abel.tesfaye@example.com' })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  phone?: string | null;

  @ApiProperty({ example: 'https://cdn.example.com/cv/abel.pdf' })
  @IsString()
  @IsNotEmpty()
  resumeUrl!: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  linkedinUrl?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  portfolioUrl?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  githubUrl?: string | null;

  @ApiPropertyOptional({ enum: CANDIDATE_SOURCES })
  @IsOptional()
  @Transform(normalizeEnumValue)
  @IsEnum(CANDIDATE_SOURCES)
  source?: (typeof CANDIDATE_SOURCES)[number];

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsUUID()
  referredById?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  currentCompany?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  currentPosition?: string | null;

  @ApiPropertyOptional({ nullable: true, example: 6 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(80)
  yearsExperience?: number | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  location?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  nationality?: string | null;

  @ApiPropertyOptional({ nullable: true, example: 145000 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  expectedSalary?: number | null;

  @ApiPropertyOptional({ nullable: true, example: 120000 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  currentSalary?: number | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  educationLevel?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  highestDegree?: string | null;

  @ApiPropertyOptional({ type: [String], default: [] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  coverLetter?: string | null;

  @ApiPropertyOptional({ nullable: true, type: () => Object })
  @IsOptional()
  @IsObject()
  sourceSnapshot?: Record<string, unknown> | null;

  @ApiPropertyOptional({ nullable: true, type: () => Object })
  @IsOptional()
  @IsObject()
  customFieldValues?: Record<string, unknown> | null;

  @ApiPropertyOptional({ type: [ApplicantEducationInputDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApplicantEducationInputDto)
  educations?: ApplicantEducationInputDto[];

  @ApiPropertyOptional({ type: [ApplicantExperienceInputDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApplicantExperienceInputDto)
  experiences?: ApplicantExperienceInputDto[];
}

export class UpdateApplicantDto extends PartialType(CreateApplicantDto) {}

export class UpdateApplicantStatusDto {
  @ApiProperty({ enum: APPLICANT_STATUSES })
  @Transform(normalizeEnumValue)
  @IsEnum(APPLICANT_STATUSES)
  status!: (typeof APPLICANT_STATUSES)[number];

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string | null;
}

export class ApplicantEducationResponseDto extends ApplicantEducationInputDto {
  @ApiProperty()
  id!: string;
}

export class ApplicantExperienceResponseDto extends ApplicantExperienceInputDto {
  @ApiProperty()
  id!: string;
}

export class ApplicantStatusHistoryResponseDto {
  @ApiProperty()
  id!: string;

  @ApiPropertyOptional({ nullable: true })
  changedById!: string | null;

  @ApiPropertyOptional({ nullable: true, enum: APPLICANT_STATUSES })
  fromStatus!: (typeof APPLICANT_STATUSES)[number] | null;

  @ApiProperty({ enum: APPLICANT_STATUSES })
  toStatus!: (typeof APPLICANT_STATUSES)[number];

  @ApiPropertyOptional({ nullable: true })
  notes!: string | null;

  @ApiProperty()
  changedAt!: string;
}

export class ApplicantResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  jobId!: string;

  @ApiPropertyOptional({ nullable: true })
  applicationFormId!: string | null;

  @ApiProperty()
  firstName!: string;

  @ApiProperty()
  lastName!: string;

  @ApiProperty()
  email!: string;

  @ApiPropertyOptional({ nullable: true })
  phone!: string | null;

  @ApiPropertyOptional({ nullable: true })
  resumeUrl!: string | null;

  @ApiPropertyOptional({ nullable: true })
  linkedinUrl!: string | null;

  @ApiPropertyOptional({ nullable: true })
  portfolioUrl!: string | null;

  @ApiPropertyOptional({ nullable: true })
  githubUrl!: string | null;

  @ApiProperty({ enum: CANDIDATE_SOURCES })
  source!: (typeof CANDIDATE_SOURCES)[number];

  @ApiPropertyOptional({ nullable: true })
  referredById!: string | null;

  @ApiPropertyOptional({ nullable: true })
  currentCompany!: string | null;

  @ApiPropertyOptional({ nullable: true })
  currentPosition!: string | null;

  @ApiPropertyOptional({ nullable: true })
  yearsExperience!: number | null;

  @ApiPropertyOptional({ nullable: true })
  location!: string | null;

  @ApiPropertyOptional({ nullable: true })
  nationality!: string | null;

  @ApiPropertyOptional({ nullable: true })
  expectedSalary!: string | null;

  @ApiPropertyOptional({ nullable: true })
  currentSalary!: string | null;

  @ApiPropertyOptional({ nullable: true })
  educationLevel!: string | null;

  @ApiPropertyOptional({ nullable: true })
  highestDegree!: string | null;

  @ApiProperty({ type: [String] })
  skills!: string[];

  @ApiProperty({ enum: APPLICANT_STATUSES })
  status!: (typeof APPLICANT_STATUSES)[number];

  @ApiPropertyOptional({ nullable: true })
  coverLetter!: string | null;

  @ApiPropertyOptional({ nullable: true, type: () => Object })
  sourceSnapshot!: Record<string, unknown> | null;

  @ApiPropertyOptional({ nullable: true, type: () => Object })
  customFieldValues!: Record<string, unknown> | null;

  @ApiProperty()
  appliedAt!: string;

  @ApiPropertyOptional({ nullable: true })
  screeningAt!: string | null;

  @ApiPropertyOptional({ nullable: true })
  shortlistedAt!: string | null;

  @ApiPropertyOptional({ nullable: true })
  interviewAt!: string | null;

  @ApiPropertyOptional({ nullable: true })
  waitlistAt!: string | null;

  @ApiPropertyOptional({ nullable: true })
  offerAt!: string | null;

  @ApiPropertyOptional({ nullable: true })
  hiredAt!: string | null;

  @ApiPropertyOptional({ nullable: true })
  rejectedAt!: string | null;

  @ApiPropertyOptional({ nullable: true })
  withdrawnAt!: string | null;

  @ApiPropertyOptional({ nullable: true })
  lastActivityAt!: string | null;

  @ApiPropertyOptional({ nullable: true })
  profileScore!: number | null;

  @ApiProperty({ type: [ApplicantEducationResponseDto] })
  educations!: ApplicantEducationResponseDto[];

  @ApiProperty({ type: [ApplicantExperienceResponseDto] })
  experiences!: ApplicantExperienceResponseDto[];

  @ApiProperty({ type: [ApplicantStatusHistoryResponseDto] })
  statusHistory!: ApplicantStatusHistoryResponseDto[];

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}

export class ApplicantListQueryDto {
  @ApiPropertyOptional({ enum: APPLICANT_STATUSES })
  @IsOptional()
  @Transform(normalizeEnumValue)
  @IsEnum(APPLICANT_STATUSES)
  status?: (typeof APPLICANT_STATUSES)[number];

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  jobId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;
}
