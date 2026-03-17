import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { CompensationComponentType } from '../../../platform/prisma/prisma-client';
import type { UpdateCompensationComponentDto as UpdateCompensationComponentDtoType } from '@repo/types';

export class UpdateCompensationComponentDto implements UpdateCompensationComponentDtoType {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: CompensationComponentType })
  @IsOptional()
  @IsEnum(CompensationComponentType)
  type?: CompensationComponentType;

  @ApiPropertyOptional({ example: '1200.00' })
  @IsOptional()
  @IsString()
  amount?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  effectiveFrom?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsDateString()
  effectiveTo?: string | null;
}
