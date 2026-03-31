import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  PhoneType,
} from '../../../../platform/prisma/prisma-client';

export class CreateEmployeeEmploymentDto {
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
  @IsString()
  employeeCode?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  changeReason?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsUUID()
  changedById?: string | null;
}

export class CreateEmployeeCompensationDto {
  @ApiPropertyOptional({ example: '8500.00', nullable: true })
  @IsOptional()
  @IsString()
  baseSalary?: string | null;

  @ApiPropertyOptional({ example: 'ETB', nullable: true })
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

  @ApiPropertyOptional({ example: '12.5', nullable: true })
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

export class CreateEmployeeProfileDto {
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
}

export class CreateEmployeeAddressDto {
  @ApiProperty()
  @IsUUID()
  countryId!: string;

  @ApiProperty()
  @IsString()
  city!: string;

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
}

export class CreateEmployeeBankAccountDto {
  @ApiProperty()
  @IsString()
  bankName!: string;

  @ApiProperty()
  @IsString()
  accountName!: string;

  @ApiProperty()
  @IsString()
  accountNumber!: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  branchName?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  swiftCode?: string | null;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateEmployeeEmergencyContactDto {
  @ApiProperty()
  @IsString()
  firstName!: string;

  @ApiProperty()
  @IsString()
  lastName!: string;

  @ApiProperty()
  @IsString()
  relationship!: string;

  @ApiProperty()
  @IsString()
  primaryPhone!: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  email?: string | null;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isFirstToCall?: boolean;

  @ApiPropertyOptional({ default: true })
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

export class CreateEmployeeEducationDto {
  @ApiProperty()
  @IsString()
  institution!: string;

  @ApiProperty()
  @IsString()
  degree!: string;

  @ApiProperty()
  @IsString()
  fieldOfStudy!: string;

  @ApiProperty({ enum: EducationLevel })
  @IsEnum(EducationLevel)
  level!: EducationLevel;

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

export class CreateEmployeeContractDto {
  @ApiProperty()
  @IsUUID()
  contractId!: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  signedFileUrl?: string | null;
}

export class CreateEmployeePolicyAcknowledgementItemDto {
  @ApiProperty()
  @IsUUID()
  policyId!: string;

  @ApiProperty()
  @IsUUID()
  policyVersionId!: string;
}

export class CreateEmployeePolicyAcknowledgementsDto {
  @ApiProperty({ type: () => [CreateEmployeePolicyAcknowledgementItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEmployeePolicyAcknowledgementItemDto)
  acknowledgements!: CreateEmployeePolicyAcknowledgementItemDto[];
}

export class CreateEmployeeDto {
  @ApiProperty()
  @IsString()
  firstName!: string;

  @ApiProperty()
  @IsString()
  lastName!: string;

  @ApiProperty({ description: 'Primary email used for auth (User.email).' })
  @IsString()
  primaryEmail!: string;

  @ApiProperty({ description: 'Primary phone used for auth (User.phone).' })
  @IsString()
  primaryPhone!: string;

  @ApiProperty({ description: 'Additional email stored in UserProfile.' })
  @IsString()
  additionalEmail!: string;

  @ApiProperty({ description: 'Additional phone stored in UserProfile.' })
  @IsString()
  additionalPhone!: string;

  @ApiProperty({ enum: PhoneType })
  @IsEnum(PhoneType)
  additionalPhoneType!: PhoneType;

  @ApiPropertyOptional({
    enum: EmployeeStatus,
    default: EmployeeStatus.ONBOARDING,
  })
  @IsOptional()
  @IsEnum(EmployeeStatus)
  employeeStatus?: EmployeeStatus;

  @ApiPropertyOptional({
    type: () => CreateEmployeeEmploymentDto,
    nullable: true,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateEmployeeEmploymentDto)
  employment?: CreateEmployeeEmploymentDto | null;

  @ApiPropertyOptional({
    type: () => CreateEmployeeCompensationDto,
    nullable: true,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateEmployeeCompensationDto)
  compensation?: CreateEmployeeCompensationDto | null;

  @ApiPropertyOptional({ type: () => CreateEmployeeProfileDto, nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateEmployeeProfileDto)
  profile?: CreateEmployeeProfileDto | null;

  @ApiProperty({ type: () => CreateEmployeeAddressDto })
  @ValidateNested()
  @Type(() => CreateEmployeeAddressDto)
  address!: CreateEmployeeAddressDto;

  @ApiProperty({ type: () => [CreateEmployeeBankAccountDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEmployeeBankAccountDto)
  bankAccounts!: CreateEmployeeBankAccountDto[];

  @ApiProperty({ type: () => [CreateEmployeeEmergencyContactDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEmployeeEmergencyContactDto)
  emergencyContacts!: CreateEmployeeEmergencyContactDto[];

  @ApiProperty({ type: () => [CreateEmployeeEducationDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEmployeeEducationDto)
  educations!: CreateEmployeeEducationDto[];

  @ApiPropertyOptional({
    type: () => CreateEmployeeContractDto,
    nullable: true,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateEmployeeContractDto)
  contract?: CreateEmployeeContractDto | null;

  @ApiPropertyOptional({
    type: () => CreateEmployeePolicyAcknowledgementsDto,
    nullable: true,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateEmployeePolicyAcknowledgementsDto)
  policyAcknowledgements?: CreateEmployeePolicyAcknowledgementsDto | null;
}
