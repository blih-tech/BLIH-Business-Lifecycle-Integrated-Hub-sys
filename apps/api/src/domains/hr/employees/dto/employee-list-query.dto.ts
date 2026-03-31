import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import {
  EmployeeStatus,
  EmploymentType,
  LifecycleStatus,
  VerificationStatus,
} from '../../../../platform/prisma/prisma-client';

export class EmployeeListQueryDto {
  @ApiPropertyOptional({
    description: 'Free-text search across employee fields.',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: EmployeeStatus })
  @IsOptional()
  @IsEnum(EmployeeStatus)
  employeeStatus?: EmployeeStatus;

  @ApiPropertyOptional({ enum: LifecycleStatus })
  @IsOptional()
  @IsEnum(LifecycleStatus)
  lifecycleStatus?: LifecycleStatus;

  @ApiPropertyOptional({ enum: EmploymentType })
  @IsOptional()
  @IsEnum(EmploymentType)
  employmentType?: EmploymentType;

  @ApiPropertyOptional({ description: 'Filter by position UUID.' })
  @IsOptional()
  @IsUUID()
  positionId?: string;

  @ApiPropertyOptional({ description: 'Filter by department UUID.' })
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @ApiPropertyOptional({ description: 'Filter by address country UUID.' })
  @IsOptional()
  @IsUUID()
  countryId?: string;

  @ApiPropertyOptional({ description: 'Filter by address city.' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ enum: VerificationStatus })
  @IsOptional()
  @IsEnum(VerificationStatus)
  profileStatus?: VerificationStatus;

  @ApiPropertyOptional({ enum: VerificationStatus })
  @IsOptional()
  @IsEnum(VerificationStatus)
  addressStatus?: VerificationStatus;

  @ApiPropertyOptional({ enum: VerificationStatus })
  @IsOptional()
  @IsEnum(VerificationStatus)
  bankStatus?: VerificationStatus;

  @ApiPropertyOptional({ enum: VerificationStatus })
  @IsOptional()
  @IsEnum(VerificationStatus)
  emergencyContactStatus?: VerificationStatus;

  @ApiPropertyOptional({ enum: VerificationStatus })
  @IsOptional()
  @IsEnum(VerificationStatus)
  educationStatus?: VerificationStatus;

  @ApiPropertyOptional({
    default: 1,
    minimum: 1,
    description: 'Page index (1-based).',
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value as string, 10))
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    default: 20,
    minimum: 1,
    maximum: 100,
    description: 'Items per page.',
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value as string, 10))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
