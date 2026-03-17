import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PayFrequency } from '../../../platform/prisma/prisma-client';
import type { UserCompensationHistoryResponseDto as UserCompensationHistoryResponseDtoType } from '@repo/types';

export class UserCompensationHistoryResponseDto implements UserCompensationHistoryResponseDtoType {
  @ApiProperty({ example: '0e189169-f04e-4212-bc09-215ba81041f2' })
  id!: string;

  @ApiProperty({ example: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374' })
  userId!: string;

  @ApiPropertyOptional({ nullable: true, example: '9000.00' })
  baseSalary?: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'USD' })
  currency?: string | null;

  @ApiProperty({ enum: PayFrequency, example: PayFrequency.MONTHLY })
  payFrequency!: PayFrequency;

  @ApiProperty({ example: true })
  bonusEligible!: boolean;

  @ApiPropertyOptional({ nullable: true, example: '15.00' })
  bonusRate?: string | null;

  @ApiProperty({ example: '2025-12-01' })
  validFrom!: string;

  @ApiPropertyOptional({ nullable: true, example: null })
  validTo?: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'Annual merit review' })
  changeReason?: string | null;

  @ApiPropertyOptional({
    nullable: true,
    example: '40b5c2fb-7a2f-4af2-ac03-fad1bb3fe061',
  })
  changedById?: string | null;

  @ApiProperty({ example: '2025-12-01T08:00:00.000Z' })
  createdAt!: string;
}
