import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { PayFrequency } from '../../../platform/prisma/prisma-client';
import type { UpdateUserCompensationDto as UpdateUserCompensationDtoType } from '@repo/types';

export class UpdateUserCompensationDto implements UpdateUserCompensationDtoType {
  @ApiPropertyOptional({ example: '8500.00' })
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

  @ApiPropertyOptional({ example: '12.5' })
  @IsOptional()
  @IsString()
  bonusRate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  effectiveFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  effectiveTo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  changeReason?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  changedBy?: string;
}
