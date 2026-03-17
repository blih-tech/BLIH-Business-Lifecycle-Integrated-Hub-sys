import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  EmploymentType,
  LifecycleStatus,
} from '../../../../platform/prisma/prisma-client';

class EmployeeFullProfileResponseDto {
  @ApiPropertyOptional({ nullable: true, example: '1993-07-18T00:00:00.000Z' })
  dateOfBirth!: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'FEMALE' })
  gender!: string | null;

  @ApiPropertyOptional({
    nullable: true,
    example: '7e782af1-7f33-49fd-b4d9-ae4868f5dd82',
  })
  nationalityId!: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'Ethiopian' })
  nationalityName!: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'SINGLE' })
  maritalStatus!: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'Bole Road' })
  addressLine1!: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'Woreda 03' })
  addressLine2!: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'Addis Ababa' })
  city!: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'Addis Ababa' })
  state!: string | null;

  @ApiPropertyOptional({
    nullable: true,
    example: '2c3fdc4f-1f45-4314-bcc4-2506575dd2ec',
  })
  countryId!: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'Ethiopia' })
  countryName!: string | null;

  @ApiPropertyOptional({ nullable: true, example: '1000' })
  postalCode!: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'Abel Doe' })
  emergencyContactName!: string | null;

  @ApiPropertyOptional({ nullable: true, example: '+251911000000' })
  emergencyContactPhone!: string | null;
}

class EmployeeFullEmploymentResponseDto {
  @ApiPropertyOptional({ nullable: true, example: 'EMP-00124' })
  employeeCode!: string | null;

  @ApiPropertyOptional({
    nullable: true,
    example: '1f31a301-dfb8-4071-aab1-ad6bc4891da7',
  })
  departmentId!: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'Engineering' })
  departmentName!: string | null;

  @ApiPropertyOptional({
    nullable: true,
    example: 'b6f9c3c0-88f3-4b92-9c44-4e9f5d0d4964',
  })
  positionId!: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'Senior Backend Engineer' })
  positionTitle!: string | null;

  @ApiProperty({ enum: EmploymentType, example: EmploymentType.FULL_TIME })
  employmentType!: EmploymentType;

  @ApiPropertyOptional({
    nullable: true,
    example: '7c7fd4b4-f2af-42fd-b9c7-c0b1afb014f7',
  })
  managerEmploymentId!: string | null;

  @ApiPropertyOptional({ nullable: true, example: '2025-12-01T00:00:00.000Z' })
  hiredAt!: string | null;

  @ApiPropertyOptional({ nullable: true, example: '2026-03-01T00:00:00.000Z' })
  probationEndAt!: string | null;

  @ApiPropertyOptional({ nullable: true, example: null })
  confirmedAt!: string | null;
}

class EmployeeCompensationSummaryResponseDto {
  @ApiPropertyOptional({ nullable: true, example: 'USD' })
  currency!: string | null;

  @ApiProperty({ example: 102000 })
  annualBaseSalary!: number;

  @ApiProperty({ example: 8500 })
  periodBaseSalary!: number;

  @ApiProperty({ example: 4800 })
  recurringAnnualComponents!: number;

  @ApiProperty({ example: 400 })
  recurringPeriodComponents!: number;

  @ApiProperty({ example: 1200 })
  oneTimeComponentsTotal!: number;

  @ApiPropertyOptional({ nullable: true, example: 12750 })
  estimatedAnnualBonus!: number | null;

  @ApiProperty({ example: 119550 })
  totalAnnualCompensation!: number;

  @ApiProperty({ example: 9950 })
  totalPeriodCompensation!: number;
}

class EmployeeFullCompensationResponseDto {
  @ApiPropertyOptional({ nullable: true, example: '8500.00' })
  baseSalary!: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'USD' })
  currency!: string | null;

  @ApiProperty({ example: 'MONTHLY' })
  payFrequency!: string;

  @ApiProperty({ example: true })
  bonusEligible!: boolean;

  @ApiPropertyOptional({ nullable: true, example: '12.50' })
  bonusRate!: string | null;

  @ApiPropertyOptional({ nullable: true, example: '2026-01-01T00:00:00.000Z' })
  effectiveFrom!: string | null;

  @ApiPropertyOptional({ nullable: true, example: null })
  effectiveTo!: string | null;

  @ApiProperty({ type: EmployeeCompensationSummaryResponseDto })
  summary!: EmployeeCompensationSummaryResponseDto;
}

class EmployeeFullLifecycleResponseDto {
  @ApiProperty({ enum: LifecycleStatus, example: LifecycleStatus.ACTIVE })
  status!: LifecycleStatus;

  @ApiPropertyOptional({ nullable: true, example: '2025-12-01T00:00:00.000Z' })
  onboardedAt!: string | null;

  @ApiPropertyOptional({ nullable: true, example: null })
  suspendedAt!: string | null;

  @ApiPropertyOptional({ nullable: true, example: null })
  terminatedAt!: string | null;

  @ApiProperty({ example: false })
  offboardingCompleted!: boolean;
}

export class EmployeeListItemResponseDto {
  @ApiProperty({ example: 'd53219ba-7856-4c17-94bc-c40d6a7d0895' })
  id!: string;

  @ApiPropertyOptional({
    nullable: true,
    example: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374',
  })
  userId!: string | null;

  @ApiPropertyOptional({
    nullable: true,
    example: 'ae3fdb37-c555-4b17-b320-d5f8b435f667',
  })
  keycloakId!: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'jane.doe' })
  username!: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'jane.doe@blih.local' })
  email!: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'Jane' })
  firstName!: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'Doe' })
  lastName!: string | null;

  @ApiPropertyOptional({ nullable: true, example: '+251911000000' })
  phone!: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'ACTIVE' })
  status!: string | null;

  @ApiPropertyOptional({
    nullable: true,
    example: '1f31a301-dfb8-4071-aab1-ad6bc4891da7',
  })
  departmentId!: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'Engineering' })
  departmentName!: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'EMP-00124' })
  employeeCode!: string | null;

  @ApiPropertyOptional({
    nullable: true,
    example: 'b6f9c3c0-88f3-4b92-9c44-4e9f5d0d4964',
  })
  positionId!: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'Senior Backend Engineer' })
  positionTitle!: string | null;

  @ApiProperty({ enum: EmploymentType, example: EmploymentType.FULL_TIME })
  employmentType!: EmploymentType;

  @ApiPropertyOptional({ nullable: true, example: LifecycleStatus.ACTIVE })
  lifecycleStatus!: LifecycleStatus | null;

  @ApiPropertyOptional({ nullable: true, example: '2025-12-01T00:00:00.000Z' })
  hiredAt!: string | null;

  @ApiProperty({ example: '2025-12-01T08:00:00.000Z' })
  createdAt!: string;
}

export class EmployeeFullResponseDto {
  @ApiProperty({ example: 'd53219ba-7856-4c17-94bc-c40d6a7d0895' })
  id!: string;

  @ApiPropertyOptional({
    nullable: true,
    example: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374',
  })
  userId!: string | null;

  @ApiPropertyOptional({
    nullable: true,
    example: 'ae3fdb37-c555-4b17-b320-d5f8b435f667',
  })
  keycloakId!: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'jane.doe' })
  username!: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'jane.doe@blih.local' })
  email!: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'Jane' })
  firstName!: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'Doe' })
  lastName!: string | null;

  @ApiPropertyOptional({ nullable: true, example: '+251911000000' })
  phone!: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'ACTIVE' })
  status!: string | null;

  @ApiPropertyOptional({
    nullable: true,
    example: '1f31a301-dfb8-4071-aab1-ad6bc4891da7',
  })
  departmentId!: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'Engineering' })
  departmentName!: string | null;

  @ApiPropertyOptional({
    nullable: true,
    type: EmployeeFullProfileResponseDto,
  })
  profile!: EmployeeFullProfileResponseDto | null;

  @ApiPropertyOptional({
    nullable: true,
    type: EmployeeFullEmploymentResponseDto,
  })
  employment!: EmployeeFullEmploymentResponseDto | null;

  @ApiPropertyOptional({
    nullable: true,
    type: EmployeeFullCompensationResponseDto,
  })
  compensation!: EmployeeFullCompensationResponseDto | null;

  @ApiPropertyOptional({
    nullable: true,
    type: EmployeeFullLifecycleResponseDto,
  })
  lifecycle!: EmployeeFullLifecycleResponseDto | null;

  @ApiProperty({ example: 4 })
  documentsCount!: number;

  @ApiProperty({ example: 2 })
  contractsCount!: number;

  @ApiProperty({ example: '2025-12-01T08:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-02-15T09:12:24.144Z' })
  updatedAt!: string;
}

export class EmployeeListResponseDto {
  @ApiProperty({ type: () => [EmployeeListItemResponseDto] })
  items!: EmployeeListItemResponseDto[];

  @ApiProperty({ example: 1 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 1 })
  totalPages!: number;
}
