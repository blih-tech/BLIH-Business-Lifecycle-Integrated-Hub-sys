import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export const APPLICATION_STATUSES = [
  'NEW',
  'SCREENING',
  'SHORTLISTED',
  'INTERVIEW_STAGE',
  'OFFER_PENDING',
  'HIRED',
  'REJECTED',
  'WITHDRAWN',
] as const;

export class CreateJobApplicationDto {
  @ApiProperty({ example: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374' })
  @IsUUID()
  jobId!: string;

  @ApiProperty({ example: '9f3d9dc8-8f92-4e03-ac64-af42ddceaf2a' })
  @IsUUID()
  candidateId!: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  coverLetter?: string | null;

  @ApiPropertyOptional({ nullable: true, example: 145000 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  expectedSalary?: number | null;

  @ApiPropertyOptional({ nullable: true, type: () => Object })
  @IsOptional()
  @IsObject()
  sourceSnapshot?: Record<string, unknown> | null;
}

export class UpdateApplicationStatusDto {
  @ApiProperty({ enum: APPLICATION_STATUSES })
  @IsEnum(APPLICATION_STATUSES)
  status!:
    | 'NEW'
    | 'SCREENING'
    | 'SHORTLISTED'
    | 'INTERVIEW_STAGE'
    | 'OFFER_PENDING'
    | 'HIRED'
    | 'REJECTED'
    | 'WITHDRAWN';

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string | null;
}

export class JobApplicationResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  jobId!: string;

  @ApiProperty()
  candidateId!: string;

  @ApiProperty({ enum: APPLICATION_STATUSES })
  status!:
    | 'NEW'
    | 'SCREENING'
    | 'SHORTLISTED'
    | 'INTERVIEW_STAGE'
    | 'OFFER_PENDING'
    | 'HIRED'
    | 'REJECTED'
    | 'WITHDRAWN';

  @ApiPropertyOptional({ nullable: true })
  coverLetter!: string | null;

  @ApiPropertyOptional({ nullable: true })
  expectedSalary!: string | null;

  @ApiProperty()
  appliedAt!: string;

  @ApiPropertyOptional({ nullable: true, type: () => Object })
  sourceSnapshot!: Record<string, unknown> | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}

export class JobApplicationListQueryDto {
  @ApiPropertyOptional({ enum: APPLICATION_STATUSES })
  @IsOptional()
  @IsEnum(APPLICATION_STATUSES)
  status?:
    | 'NEW'
    | 'SCREENING'
    | 'SHORTLISTED'
    | 'INTERVIEW_STAGE'
    | 'OFFER_PENDING'
    | 'HIRED'
    | 'REJECTED'
    | 'WITHDRAWN';

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  jobId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  candidateId?: string;
}
