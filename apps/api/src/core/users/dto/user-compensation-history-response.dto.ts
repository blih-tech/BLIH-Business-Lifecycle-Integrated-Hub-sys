import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PayFrequency } from '../../../platform/prisma/prisma-client';
import type { UserCompensationHistoryResponseDto as UserCompensationHistoryResponseDtoType } from '@repo/types';

export class UserCompensationHistoryResponseDto implements UserCompensationHistoryResponseDtoType {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiPropertyOptional({ nullable: true, example: '9000.00' })
  baseSalary?: string | null;

  @ApiPropertyOptional({ nullable: true })
  currency?: string | null;

  @ApiProperty({ enum: PayFrequency })
  payFrequency!: PayFrequency;

  @ApiProperty()
  bonusEligible!: boolean;

  @ApiPropertyOptional({ nullable: true, example: '15.00' })
  bonusRate?: string | null;

  @ApiProperty()
  validFrom!: string;

  @ApiPropertyOptional({ nullable: true })
  validTo?: string | null;

  @ApiPropertyOptional({ nullable: true })
  changeReason?: string | null;

  @ApiPropertyOptional({ nullable: true })
  changedBy?: string | null;

  @ApiProperty()
  createdAt!: string;
}
