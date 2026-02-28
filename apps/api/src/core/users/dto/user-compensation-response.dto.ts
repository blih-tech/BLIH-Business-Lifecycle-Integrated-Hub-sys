import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PayFrequency } from '../../../platform/prisma/prisma-client';
import type { UserCompensationResponseDto as UserCompensationResponseDtoType } from '@repo/types';

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

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}
