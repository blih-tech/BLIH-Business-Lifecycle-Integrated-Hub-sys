import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import {
  EducationLevel,
  EmployeeStatus,
  EmploymentType,
  Gender,
  GovernmentIdCardType,
  MaritalStatus,
  PayFrequency,
  VerificationStatus,
} from '../../../../platform/prisma/prisma-client';

export class UpdateEmployeeEmploymentDto {
  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  employeeCode?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsUUID()
  positionId?: string | null;

  @ApiPropertyOptional({ enum: EmploymentType })
  @IsOptional()
  @IsEnum(EmploymentType)
  employmentType?: EmploymentType;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsUUID()
  managerEmploymentId?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsDateString()
  hiredAt?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsDateString()
  probationEndAt?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsDateString()
  confirmedAt?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  changeReason?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsUUID()
  changedById?: string | null;
}

export class UpdateEmployeeCompensationDto {
  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  baseSalary?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  currency?: string | null;

  @ApiPropertyOptional({ enum: PayFrequency })
  @IsOptional()
  @IsEnum(PayFrequency)
  payFrequency?: PayFrequency;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  bonusEligible?: boolean;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  bonusRate?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsDateString()
  effectiveFrom?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsDateString()
  effectiveTo?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  changeReason?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsUUID()
  changedById?: string | null;
}

export class UpdateEmployeeProfileDto {
  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string | null;

  @ApiPropertyOptional({ enum: Gender, nullable: true })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsUUID()
  nationalityId?: string | null;

  @ApiPropertyOptional({ enum: MaritalStatus, nullable: true })
  @IsOptional()
  @IsEnum(MaritalStatus)
  maritalStatus?: MaritalStatus | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  avatarUrl?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  passportSizePhotoURL?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  faydaNumber?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  governmentIdCard?: string | null;

  @ApiPropertyOptional({ enum: GovernmentIdCardType, nullable: true })
  @IsOptional()
  @IsEnum(GovernmentIdCardType)
  governmentIdCardType?: GovernmentIdCardType | null;

  @ApiPropertyOptional({ enum: VerificationStatus })
  @IsOptional()
  @IsEnum(VerificationStatus)
  status?: VerificationStatus;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  hrFeedback?: string | null;
}

export class UpdateEmployeeAddressDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  countryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  region?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  subCity?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  woreda?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  kebele?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  street?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  houseNumber?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  postalCode?: string | null;

  @ApiPropertyOptional({ enum: VerificationStatus })
  @IsOptional()
  @IsEnum(VerificationStatus)
  status?: VerificationStatus;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  hrFeedback?: string | null;
}

export class UpdateEmployeeBankAccountDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  accountName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  accountNumber?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  branchName?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  swiftCode?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateEmployeeBankDetailDto {
  @ApiPropertyOptional({ type: () => [UpdateEmployeeBankAccountDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateEmployeeBankAccountDto)
  bankAccounts?: UpdateEmployeeBankAccountDto[];

  @ApiPropertyOptional({ enum: VerificationStatus })
  @IsOptional()
  @IsEnum(VerificationStatus)
  status?: VerificationStatus;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  hrFeedback?: string | null;
}

export class UpdateEmployeeEmergencyContactDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  relationship?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  primaryPhone?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  email?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isFirstToCall?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsUUID()
  countryId?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  city?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  subCity?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  woreda?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  kebele?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  street?: string | null;
}

export class UpdateEmployeeEmergencyContactsDto {
  @ApiPropertyOptional({ type: () => [UpdateEmployeeEmergencyContactDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateEmployeeEmergencyContactDto)
  emergencyContacts?: UpdateEmployeeEmergencyContactDto[];

  @ApiPropertyOptional({ enum: VerificationStatus })
  @IsOptional()
  @IsEnum(VerificationStatus)
  status?: VerificationStatus;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  hrFeedback?: string | null;
}

export class UpdateEmployeeEducationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  institution?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  degree?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fieldOfStudy?: string;

  @ApiPropertyOptional({ enum: EducationLevel })
  @IsOptional()
  @IsEnum(EducationLevel)
  level?: EducationLevel;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsDateString()
  startDate?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsDateString()
  endDate?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  grade?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  documentUrl?: string | null;
}

export class UpdateEmployeeEducationWrapperDto {
  @ApiPropertyOptional({ type: () => [UpdateEmployeeEducationDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateEmployeeEducationDto)
  educations?: UpdateEmployeeEducationDto[];

  @ApiPropertyOptional({ enum: VerificationStatus })
  @IsOptional()
  @IsEnum(VerificationStatus)
  status?: VerificationStatus;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  hrFeedback?: string | null;
}

export class UpdateEmployeeDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ enum: EmployeeStatus })
  @IsOptional()
  @IsEnum(EmployeeStatus)
  employeeStatus?: EmployeeStatus;

  @ApiPropertyOptional({
    type: () => UpdateEmployeeEmploymentDto,
    nullable: true,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateEmployeeEmploymentDto)
  employment?: UpdateEmployeeEmploymentDto | null;

  @ApiPropertyOptional({
    type: () => UpdateEmployeeCompensationDto,
    nullable: true,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateEmployeeCompensationDto)
  compensation?: UpdateEmployeeCompensationDto | null;

  @ApiPropertyOptional({ type: () => UpdateEmployeeProfileDto, nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateEmployeeProfileDto)
  profile?: UpdateEmployeeProfileDto | null;

  @ApiPropertyOptional({ type: () => UpdateEmployeeAddressDto, nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateEmployeeAddressDto)
  address?: UpdateEmployeeAddressDto | null;

  @ApiPropertyOptional({
    type: () => UpdateEmployeeBankDetailDto,
    nullable: true,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateEmployeeBankDetailDto)
  bankDetail?: UpdateEmployeeBankDetailDto | null;

  @ApiPropertyOptional({
    type: () => UpdateEmployeeEmergencyContactsDto,
    nullable: true,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateEmployeeEmergencyContactsDto)
  emergencyContacts?: UpdateEmployeeEmergencyContactsDto | null;

  @ApiPropertyOptional({
    type: () => UpdateEmployeeEducationWrapperDto,
    nullable: true,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateEmployeeEducationWrapperDto)
  education?: UpdateEmployeeEducationWrapperDto | null;
}
