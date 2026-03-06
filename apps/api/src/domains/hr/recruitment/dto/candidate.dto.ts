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
