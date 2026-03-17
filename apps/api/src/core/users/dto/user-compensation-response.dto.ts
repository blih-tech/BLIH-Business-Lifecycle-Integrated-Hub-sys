import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PayFrequency } from '../../../platform/prisma/prisma-client';
import type { UserCompensationResponseDto as UserCompensationResponseDtoType } from '@repo/types';
import { CompensationComponentResponseDto } from './compensation-component-response.dto';

class UserCompensationSummaryResponseDto implements NonNullable<
  UserCompensationResponseDtoType['summary']
> {
  @ApiPropertyOptional({ nullable: true, example: 'USD' })
  currency!: string | null;

  @ApiProperty({ example: 102000 })
  annualBaseSalary!: number;

  @ApiProperty({ example: 8500 })
  periodBaseSalary!: number;

  @ApiProperty({ example: 4800 })
  recurringAnnualComponents!: number;

  @ApiProperty({ example: 400 })
  recurringPeriodComponents!: number;

  @ApiProperty({ example: 1200 })
  oneTimeComponentsTotal!: number;

  @ApiPropertyOptional({ nullable: true, example: 12750 })
  estimatedAnnualBonus!: number | null;

  @ApiProperty({ example: 119550 })
  totalAnnualCompensation!: number;

  @ApiProperty({ example: 9950 })
  totalPeriodCompensation!: number;
}

export class UserCompensationResponseDto implements UserCompensationResponseDtoType {
  @ApiProperty({ example: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374' })
  userId!: string;

  @ApiPropertyOptional({ nullable: true, example: '8500.00' })
  baseSalary?: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'USD' })
  currency?: string | null;

  @ApiProperty({ enum: PayFrequency, example: PayFrequency.MONTHLY })
  payFrequency!: PayFrequency;

  @ApiProperty({ example: true })
  bonusEligible!: boolean;

  @ApiPropertyOptional({ nullable: true, example: '12.50' })
  bonusRate?: string | null;

  @ApiPropertyOptional({ nullable: true, example: '2026-01-01' })
  effectiveFrom?: string | null;

  @ApiPropertyOptional({ nullable: true, example: null })
  effectiveTo?: string | null;

  @ApiPropertyOptional({
    type: CompensationComponentResponseDto,
    isArray: true,
  })
  components?: CompensationComponentResponseDto[];

  @ApiPropertyOptional({ type: UserCompensationSummaryResponseDto })
  summary?: UserCompensationResponseDtoType['summary'];

  @ApiProperty({ example: '2026-01-01T08:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-02-15T09:12:24.144Z' })
  updatedAt!: string;
}
