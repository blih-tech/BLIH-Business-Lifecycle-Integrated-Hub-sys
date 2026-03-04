import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { PayFrequency } from '../../../platform/prisma/prisma-client';
import type { CreateCompensationHistoryDto as CreateCompensationHistoryDtoType } from '@repo/types';

export class CreateCompensationHistoryDto implements CreateCompensationHistoryDtoType {
  @ApiPropertyOptional({ example: '9000.00' })
  @IsOptional()
  @IsString()
  baseSalary?: string;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ enum: PayFrequency })
  @IsOptional()
  @IsEnum(PayFrequency)
  payFrequency?: PayFrequency;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  bonusEligible?: boolean;

  @ApiPropertyOptional({ example: '15.00' })
  @IsOptional()
  @IsString()
  bonusRate?: string;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  @IsDateString()
  validFrom!: string;

  @ApiPropertyOptional({ example: '2026-12-31T23:59:59.000Z' })
  @IsOptional()
  @IsDateString()
  validTo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  changeReason?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  changedById?: string;
}
