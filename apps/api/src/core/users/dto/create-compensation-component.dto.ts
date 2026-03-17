import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { CompensationComponentType } from '../../../platform/prisma/prisma-client';
import type { CreateCompensationComponentDto as CreateCompensationComponentDtoType } from '@repo/types';

export class CreateCompensationComponentDto implements CreateCompensationComponentDtoType {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty({ enum: CompensationComponentType })
  @IsEnum(CompensationComponentType)
  type!: CompensationComponentType;

  @ApiProperty({ example: '1200.00' })
  @IsString()
  amount!: string;

  @ApiProperty()
  @IsBoolean()
  isRecurring!: boolean;

  @ApiProperty()
  @IsDateString()
  effectiveFrom!: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsDateString()
  effectiveTo?: string | null;
}
