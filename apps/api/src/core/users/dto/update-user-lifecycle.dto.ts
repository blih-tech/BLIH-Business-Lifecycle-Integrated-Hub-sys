import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { LifecycleStatus } from '../../../platform/prisma/prisma-client';
import type { UpdateUserLifecycleDto as UpdateUserLifecycleDtoType } from '@repo/types';

export class UpdateUserLifecycleDto implements UpdateUserLifecycleDtoType {
  @ApiPropertyOptional({ enum: LifecycleStatus })
  @IsOptional()
  @IsEnum(LifecycleStatus)
  status?: LifecycleStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  onboardedAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  suspendedAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  terminatedAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  terminationReason?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  offboardingCompleted?: boolean;
}
