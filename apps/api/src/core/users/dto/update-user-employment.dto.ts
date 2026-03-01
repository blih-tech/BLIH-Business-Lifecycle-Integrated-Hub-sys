import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { EmploymentType } from '../../../platform/prisma/prisma-client';
import type { UpdateUserEmploymentDto as UpdateUserEmploymentDtoType } from '@repo/types';

export class UpdateUserEmploymentDto implements UpdateUserEmploymentDtoType {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  employeeCode?: string;

  @ApiPropertyOptional({
    description: 'Position id. Use null to clear position.',
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  positionId?: string | null;

  @ApiPropertyOptional({ enum: EmploymentType })
  @IsOptional()
  @IsEnum(EmploymentType)
  employmentType?: EmploymentType;

  @ApiPropertyOptional({
    description: 'Manager employment record id. Use null to clear manager.',
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  managerEmploymentId?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  hiredAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  probationEndAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  confirmedAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  changeReason?: string;

  @ApiPropertyOptional({
    description: 'User id of the actor making the employment change.',
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  changedById?: string | null;
}
