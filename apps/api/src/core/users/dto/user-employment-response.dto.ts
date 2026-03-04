import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EmploymentType } from '../../../platform/prisma/prisma-client';
import type { UserEmploymentResponseDto as UserEmploymentResponseDtoType } from '@repo/types';

export class UserEmploymentResponseDto implements UserEmploymentResponseDtoType {
  @ApiProperty()
  userId!: string;

  @ApiPropertyOptional({ nullable: true })
  employeeCode?: string | null;

  @ApiPropertyOptional({ nullable: true })
  departmentId?: string | null;

  @ApiPropertyOptional({ nullable: true })
  departmentName?: string | null;

  @ApiPropertyOptional({ nullable: true })
  positionId?: string | null;

  @ApiPropertyOptional({ nullable: true })
  positionTitle?: string | null;

  @ApiPropertyOptional({ nullable: true })
  jobGradeId?: string | null;

  @ApiPropertyOptional({ nullable: true })
  jobGradeCode?: string | null;

  @ApiPropertyOptional({ nullable: true })
  jobGradeName?: string | null;

  @ApiPropertyOptional({ nullable: true })
  jobGradeLevel?: number | null;

  @ApiProperty({ enum: EmploymentType })
  employmentType!: EmploymentType;

  @ApiPropertyOptional({ nullable: true })
  managerEmploymentId?: string | null;

  @ApiPropertyOptional({ nullable: true })
  hiredAt?: string | null;

  @ApiPropertyOptional({ nullable: true })
  probationEndAt?: string | null;

  @ApiPropertyOptional({ nullable: true })
  confirmedAt?: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}
