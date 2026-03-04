import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PayFrequency } from '../../../platform/prisma/prisma-client';
import type { UserCompensationResponseDto as UserCompensationResponseDtoType } from '@repo/types';
import { CompensationComponentResponseDto } from './compensation-component-response.dto';

class UserCompensationSummaryResponseDto implements NonNullable<
  UserCompensationResponseDtoType['summary']
> {
  @ApiPropertyOptional({ nullable: true })
  currency!: string | null;

  @ApiProperty()
  annualBaseSalary!: number;

  @ApiProperty()
  periodBaseSalary!: number;

  @ApiProperty()
  recurringAnnualComponents!: number;

  @ApiProperty()
  recurringPeriodComponents!: number;

  @ApiProperty()
  oneTimeComponentsTotal!: number;

  @ApiPropertyOptional({ nullable: true })
  estimatedAnnualBonus!: number | null;

  @ApiProperty()
  totalAnnualCompensation!: number;

  @ApiProperty()
  totalPeriodCompensation!: number;
}

export class UserCompensationResponseDto implements UserCompensationResponseDtoType {
  @ApiProperty()
  userId!: string;

  @ApiPropertyOptional({ nullable: true, example: '8500.00' })
  baseSalary?: string | null;

  @ApiPropertyOptional({ nullable: true })
  currency?: string | null;

  @ApiProperty({ enum: PayFrequency })
  payFrequency!: PayFrequency;

  @ApiProperty()
  bonusEligible!: boolean;

  @ApiPropertyOptional({ nullable: true, example: '12.50' })
  bonusRate?: string | null;

  @ApiPropertyOptional({ nullable: true })
  effectiveFrom?: string | null;

  @ApiPropertyOptional({ nullable: true })
  effectiveTo?: string | null;

  @ApiPropertyOptional({
    type: CompensationComponentResponseDto,
    isArray: true,
  })
  components?: CompensationComponentResponseDto[];

  @ApiPropertyOptional({ type: UserCompensationSummaryResponseDto })
  summary?: UserCompensationResponseDtoType['summary'];

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}
