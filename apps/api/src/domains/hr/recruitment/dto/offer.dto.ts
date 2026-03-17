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
import {
  EMPLOYMENT_TYPES,
  OFFER_STATUSES,
  PAY_FREQUENCIES,
  RESPOND_OFFER_DECISIONS,
} from '@repo/types';
import type {
  CreateOfferDto as CreateOfferDtoType,
  EmploymentType,
  OfferListQueryDto as OfferListQueryDtoType,
  OfferResponseDto as OfferResponseDtoType,
  OfferDecision,
  OfferStatus,
  PayFrequency,
  RespondOfferDto as RespondOfferDtoType,
  SendOfferDto as SendOfferDtoType,
  UpdateOfferDto as UpdateOfferDtoType,
  WithdrawOfferDto as WithdrawOfferDtoType,
} from '@repo/types';

export class CreateOfferDto implements CreateOfferDtoType {
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

export class UpdateOfferDto
  extends PartialType(CreateOfferDto)
  implements UpdateOfferDtoType {}

export class SendOfferDto implements SendOfferDtoType {
  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsDateString()
  expiresAt?: string | null;
}

export class RespondOfferDto implements RespondOfferDtoType {
  @ApiProperty({ enum: RESPOND_OFFER_DECISIONS })
  @IsEnum(RESPOND_OFFER_DECISIONS)
  decision!: OfferDecision;
}

export class WithdrawOfferDto implements WithdrawOfferDtoType {
  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  reason?: string | null;
}

export class OfferResponseDto implements OfferResponseDtoType {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  jobId!: string;

  @ApiProperty()
  applicantId!: string;

  @ApiProperty()
  createdById!: string;

  @ApiProperty({ enum: OFFER_STATUSES })
  status!: OfferStatus;

  @ApiPropertyOptional({ nullable: true })
  salary!: string | null;

  @ApiPropertyOptional({ nullable: true })
  currency!: string | null;

  @ApiPropertyOptional({ nullable: true })
  startDate!: string | null;

  @ApiPropertyOptional({ enum: PAY_FREQUENCIES, nullable: true })
  payFrequency!: PayFrequency | null;

  @ApiPropertyOptional({ enum: EMPLOYMENT_TYPES, nullable: true })
  employmentType!: EmploymentType | null;

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

  @ApiPropertyOptional({ nullable: true })
  employeeId!: string | null;

  @ApiPropertyOptional({ nullable: true })
  userId!: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}

export class OfferListQueryDto implements OfferListQueryDtoType {
  @ApiPropertyOptional({ enum: OFFER_STATUSES })
  @IsOptional()
  @IsEnum(OFFER_STATUSES)
  status?: OfferStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  jobId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  applicantId?: string;
}
