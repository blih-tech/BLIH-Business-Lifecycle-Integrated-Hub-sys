import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';

export const OFFER_STATUSES = [
  'DRAFT',
  'SENT',
  'ACCEPTED',
  'DECLINED',
  'EXPIRED',
  'WITHDRAWN',
] as const;

export const PAY_FREQUENCIES = [
  'MONTHLY',
  'BIWEEKLY',
  'WEEKLY',
  'ANNUAL',
] as const;

export const EMPLOYMENT_TYPES = [
  'FULL_TIME',
  'PART_TIME',
  'CONTRACT',
  'INTERN',
  'TEMPORARY',
] as const;

export class CreateOfferDto {
  @ApiProperty({ example: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374' })
  @IsUUID()
  jobId!: string;

  @ApiProperty({ example: '8dea40a6-4ee2-4cca-9ff3-ac9e95e50384' })
  @IsUUID()
  applicantId!: string;

  @ApiPropertyOptional({ nullable: true, example: 145000 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  salary?: number | null;

  @ApiPropertyOptional({ nullable: true, example: 'USD' })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{3}$/)
  currency?: string | null;

  @ApiPropertyOptional({
    nullable: true,
    description: 'ISO date string (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string | null;

  @ApiPropertyOptional({ enum: PAY_FREQUENCIES, nullable: true })
  @IsOptional()
  @IsEnum(PAY_FREQUENCIES)
  payFrequency?: (typeof PAY_FREQUENCIES)[number] | null;

  @ApiPropertyOptional({ enum: EMPLOYMENT_TYPES, nullable: true })
  @IsOptional()
  @IsEnum(EMPLOYMENT_TYPES)
  employmentType?: (typeof EMPLOYMENT_TYPES)[number] | null;

  @ApiPropertyOptional({ nullable: true, example: 5000 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  bonus?: number | null;

  @ApiPropertyOptional({ nullable: true, example: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  equity?: number | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  offerLetterUrl?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsDateString()
  expiresAt?: string | null;
}

export class UpdateOfferDto extends PartialType(CreateOfferDto) {}

export class SendOfferDto {
  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsDateString()
  expiresAt?: string | null;
}

export class RespondOfferDto {
  @ApiProperty({ enum: ['ACCEPTED', 'DECLINED'] })
  @IsEnum(['ACCEPTED', 'DECLINED'])
  decision!: 'ACCEPTED' | 'DECLINED';
}

export class WithdrawOfferDto {
  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  reason?: string | null;
}

export class OfferResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  jobId!: string;

  @ApiProperty()
  applicantId!: string;

  @ApiProperty()
  createdById!: string;

  @ApiProperty({ enum: OFFER_STATUSES })
  status!: (typeof OFFER_STATUSES)[number];

  @ApiPropertyOptional({ nullable: true })
  salary!: string | null;

  @ApiPropertyOptional({ nullable: true })
  currency!: string | null;

  @ApiPropertyOptional({ nullable: true })
  startDate!: string | null;

  @ApiPropertyOptional({ enum: PAY_FREQUENCIES, nullable: true })
  payFrequency!: (typeof PAY_FREQUENCIES)[number] | null;

  @ApiPropertyOptional({ enum: EMPLOYMENT_TYPES, nullable: true })
  employmentType!: (typeof EMPLOYMENT_TYPES)[number] | null;

  @ApiPropertyOptional({ nullable: true })
  bonus!: string | null;

  @ApiPropertyOptional({ nullable: true })
  equity!: string | null;

  @ApiPropertyOptional({ nullable: true })
  offerLetterUrl!: string | null;

  @ApiPropertyOptional({ nullable: true })
  notes!: string | null;

  @ApiPropertyOptional({ nullable: true })
  sentAt!: string | null;

  @ApiPropertyOptional({ nullable: true })
  respondedAt!: string | null;

  @ApiPropertyOptional({ nullable: true })
  expiresAt!: string | null;

  @ApiPropertyOptional({ nullable: true })
  onboardingId!: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}

export class OfferListQueryDto {
  @ApiPropertyOptional({ enum: OFFER_STATUSES })
  @IsOptional()
  @IsEnum(OFFER_STATUSES)
  status?: (typeof OFFER_STATUSES)[number];

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  jobId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  applicantId?: string;
}
