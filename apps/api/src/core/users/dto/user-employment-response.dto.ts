import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EmploymentType } from '../../../platform/prisma/prisma-client';
import type { UserEmploymentResponseDto as UserEmploymentResponseDtoType } from '@repo/types';

export class UserEmploymentResponseDto implements UserEmploymentResponseDtoType {
  @ApiProperty({ example: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374' })
  userId!: string;

  @ApiPropertyOptional({ nullable: true, example: 'EMP-00124' })
  employeeCode?: string | null;

  @ApiPropertyOptional({
    nullable: true,
    example: '1f31a301-dfb8-4071-aab1-ad6bc4891da7',
  })
  departmentId?: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'Engineering' })
  departmentName?: string | null;

  @ApiPropertyOptional({
    nullable: true,
    example: 'b6f9c3c0-88f3-4b92-9c44-4e9f5d0d4964',
  })
  positionId?: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'Senior Backend Engineer' })
  positionTitle?: string | null;

  @ApiPropertyOptional({
    nullable: true,
    example: 'f31f3668-d942-4700-bb2e-19dbdb57b7f7',
  })
  jobGradeId?: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'JG-6' })
  jobGradeCode?: string | null;

  @ApiPropertyOptional({
    nullable: true,
    example: 'Senior Individual Contributor',
  })
  jobGradeName?: string | null;

  @ApiPropertyOptional({ nullable: true, example: 6 })
  jobGradeLevel?: number | null;

  @ApiProperty({ enum: EmploymentType, example: EmploymentType.FULL_TIME })
  employmentType!: EmploymentType;

  @ApiPropertyOptional({
    nullable: true,
    example: '7c7fd4b4-f2af-42fd-b9c7-c0b1afb014f7',
  })
  managerEmploymentId?: string | null;

  @ApiPropertyOptional({ nullable: true, example: '2025-12-01' })
  hiredAt?: string | null;

  @ApiPropertyOptional({ nullable: true, example: '2026-03-01' })
  probationEndAt?: string | null;

  @ApiPropertyOptional({ nullable: true, example: '2026-03-15' })
  confirmedAt?: string | null;

  @ApiProperty({ example: '2025-12-01T08:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-02-15T09:12:24.144Z' })
  updatedAt!: string;
}
