import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

const GENDERS = ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'] as const;
const CANDIDATE_SOURCES = [
  'COMPANY_SITE',
  'LINKEDIN',
  'TELEGRAM',
  'REFERRAL',
  'AGENCY',
] as const;
const SKILL_LEVELS = [
  'BEGINNER',
  'INTERMEDIATE',
  'ADVANCED',
  'EXPERT',
] as const;

const EDUCATION_LEVELS = ['HIGH_SCHOOL', 'BACHELOR', 'MASTER', 'PHD'] as const;

export class CandidateSkillInputDto {
  @ApiProperty({ example: 'NestJS' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ enum: SKILL_LEVELS, nullable: true })
  @IsOptional()
  @IsEnum(SKILL_LEVELS)
  level?: (typeof SKILL_LEVELS)[number] | null;

  @ApiPropertyOptional({ nullable: true, example: 4 })
  @IsOptional()
  @IsInt()
  years?: number | null;
}

export class CandidateEducationInputDto {
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
  @IsString()
  startDate?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  endDate?: string | null;
}

export class CandidateExperienceInputDto {
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
  @IsString()
  startDate?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  endDate?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string | null;
}

export class CreateCandidateDto {
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

  @ApiPropertyOptional({ enum: GENDERS, nullable: true })
  @IsOptional()
  @IsEnum(GENDERS)
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY' | null;

  @ApiPropertyOptional({ nullable: true, example: 6 })
  @IsOptional()
  @IsInt()
  yearsExperience?: number | null;

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
  @IsEnum(CANDIDATE_SOURCES)
  source?: (typeof CANDIDATE_SOURCES)[number];

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsUUID()
  referredById?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  resumeUrl?: string | null;

  @ApiPropertyOptional({ type: [CandidateSkillInputDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CandidateSkillInputDto)
  skills?: CandidateSkillInputDto[];

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  location?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  country?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  city?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  nationality?: string | null;

  @ApiPropertyOptional({ nullable: true, example: 150000 })
  @IsOptional()
  @IsInt()
  expectedSalary?: number | null;

  @ApiPropertyOptional({ nullable: true, example: 120000 })
  @IsOptional()
  @IsInt()
  currentSalary?: number | null;

  @ApiPropertyOptional({ enum: EDUCATION_LEVELS, nullable: true })
  @IsOptional()
  @IsEnum(EDUCATION_LEVELS)
  educationLevel?: (typeof EDUCATION_LEVELS)[number] | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  highestDegree?: string | null;

  @ApiPropertyOptional({ type: [CandidateEducationInputDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CandidateEducationInputDto)
  educations?: CandidateEducationInputDto[];

  @ApiPropertyOptional({ type: [CandidateExperienceInputDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CandidateExperienceInputDto)
  experiences?: CandidateExperienceInputDto[];
}

export class UpdateCandidateDto extends PartialType(CreateCandidateDto) {}

export class CandidateSkillResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional({ enum: SKILL_LEVELS, nullable: true })
  level!: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT' | null;

  @ApiPropertyOptional({ nullable: true })
  years!: number | null;
}

export class CandidateResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  firstName!: string;

  @ApiProperty()
  lastName!: string;

  @ApiProperty()
  email!: string;

  @ApiPropertyOptional({ nullable: true })
  phone!: string | null;

  @ApiPropertyOptional({ enum: GENDERS, nullable: true })
  gender!: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY' | null;

  @ApiPropertyOptional({ nullable: true })
  yearsExperience!: number | null;

  @ApiPropertyOptional({ nullable: true })
  linkedinUrl!: string | null;

  @ApiPropertyOptional({ nullable: true })
  portfolioUrl!: string | null;

  @ApiPropertyOptional({ nullable: true })
  githubUrl!: string | null;

  @ApiProperty({ enum: CANDIDATE_SOURCES })
  source!: 'COMPANY_SITE' | 'LINKEDIN' | 'TELEGRAM' | 'REFERRAL' | 'AGENCY';

  @ApiPropertyOptional({ nullable: true })
  referredById!: string | null;

  @ApiPropertyOptional({ nullable: true })
  resumeUrl!: string | null;

  @ApiProperty({ type: [CandidateSkillResponseDto] })
  skills!: CandidateSkillResponseDto[];

  @ApiPropertyOptional({ nullable: true })
  location!: string | null;

  @ApiPropertyOptional({ nullable: true })
  country!: string | null;

  @ApiPropertyOptional({ nullable: true })
  city!: string | null;

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

  @ApiPropertyOptional({ nullable: true })
  lastActivityAt!: string | null;

  @ApiPropertyOptional({ nullable: true })
  profileScore!: string | null;

  @ApiProperty({
    type: () => CandidateEducationInputDto,
    isArray: true,
  })
  educations!: CandidateEducationInputDto[];

  @ApiProperty({
    type: () => CandidateExperienceInputDto,
    isArray: true,
  })
  experiences!: CandidateExperienceInputDto[];

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}

export class CandidateListQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;
}
