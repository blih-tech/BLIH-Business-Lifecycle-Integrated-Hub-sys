import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type {
  EmployeeStatus,
  EmploymentType,
  LifecycleStatus,
} from '../../../../platform/prisma/prisma-client';

export class EmployeeFullProfileResponseDto {
  @ApiPropertyOptional({ nullable: true })
  additionalEmail!: string | null;

  @ApiPropertyOptional({ nullable: true })
  additionalEmailType!: string | null;

  @ApiPropertyOptional({ nullable: true })
  additionalPhone!: string | null;

  @ApiProperty()
  additionalPhoneType!: string;

  @ApiPropertyOptional({ nullable: true })
  dateOfBirth!: string | null;

  @ApiPropertyOptional({ nullable: true })
  gender!: string | null;

  @ApiPropertyOptional({ nullable: true })
  nationalityId!: string | null;

  @ApiPropertyOptional({ nullable: true })
  nationalityName!: string | null;

  @ApiPropertyOptional({ nullable: true })
  maritalStatus!: string | null;

  @ApiPropertyOptional({ nullable: true })
  avatarUrl!: string | null;

  @ApiPropertyOptional({ nullable: true })
  passportSizePhotoURL!: string | null;

  @ApiPropertyOptional({ nullable: true })
  faydaNumber!: string | null;

  @ApiPropertyOptional({ nullable: true })
  governmentIdCard!: string | null;

  @ApiPropertyOptional({ nullable: true })
  governmentIdCardType!: string | null;

  @ApiProperty()
  status!: string;

  @ApiPropertyOptional({ nullable: true })
  hrFeedback!: string | null;
}

export class EmployeeAddressResponseDto {
  @ApiProperty()
  countryId!: string;

  @ApiPropertyOptional({ nullable: true })
  countryName!: string | null;

  @ApiProperty()
  city!: string;

  @ApiPropertyOptional({ nullable: true })
  region!: string | null;

  @ApiPropertyOptional({ nullable: true })
  subCity!: string | null;

  @ApiPropertyOptional({ nullable: true })
  woreda!: string | null;

  @ApiPropertyOptional({ nullable: true })
  kebele!: string | null;

  @ApiPropertyOptional({ nullable: true })
  street!: string | null;

  @ApiPropertyOptional({ nullable: true })
  houseNumber!: string | null;

  @ApiPropertyOptional({ nullable: true })
  postalCode!: string | null;

  @ApiProperty()
  status!: string;

  @ApiPropertyOptional({ nullable: true })
  hrFeedback!: string | null;
}

export class EmployeeBankAccountResponseDto {
  @ApiProperty()
  bankName!: string;

  @ApiProperty()
  accountName!: string;

  @ApiProperty()
  accountNumber!: string;

  @ApiPropertyOptional({ nullable: true })
  branchName!: string | null;

  @ApiPropertyOptional({ nullable: true })
  swiftCode!: string | null;

  @ApiProperty()
  isPrimary!: boolean;

  @ApiProperty()
  isActive!: boolean;
}

export class EmployeeBankDetailResponseDto {
  @ApiProperty({ type: () => [EmployeeBankAccountResponseDto] })
  bankAccounts!: EmployeeBankAccountResponseDto[];

  @ApiProperty()
  status!: string;

  @ApiPropertyOptional({ nullable: true })
  hrFeedback!: string | null;
}

export class EmployeeEmergencyContactResponseDto {
  @ApiProperty()
  firstName!: string;

  @ApiProperty()
  lastName!: string;

  @ApiProperty()
  relationship!: string;

  @ApiProperty()
  primaryPhone!: string;

  @ApiPropertyOptional({ nullable: true })
  email!: string | null;

  @ApiProperty()
  isFirstToCall!: boolean;

  @ApiProperty()
  isActive!: boolean;

  @ApiPropertyOptional({ nullable: true })
  notes!: string | null;

  @ApiPropertyOptional({ nullable: true })
  countryId!: string | null;

  @ApiPropertyOptional({ nullable: true })
  city!: string | null;

  @ApiPropertyOptional({ nullable: true })
  subCity!: string | null;

  @ApiPropertyOptional({ nullable: true })
  woreda!: string | null;

  @ApiPropertyOptional({ nullable: true })
  kebele!: string | null;

  @ApiPropertyOptional({ nullable: true })
  street!: string | null;
}

export class EmployeeEmergencyContactsResponseDto {
  @ApiProperty({ type: () => [EmployeeEmergencyContactResponseDto] })
  emergencyContacts!: EmployeeEmergencyContactResponseDto[];

  @ApiProperty()
  status!: string;

  @ApiPropertyOptional({ nullable: true })
  hrFeedback!: string | null;
}

export class EmployeeEducationItemResponseDto {
  @ApiProperty()
  institution!: string;

  @ApiProperty()
  degree!: string;

  @ApiProperty()
  fieldOfStudy!: string;

  @ApiProperty()
  level!: string;

  @ApiPropertyOptional({ nullable: true })
  startDate!: string | null;

  @ApiPropertyOptional({ nullable: true })
  endDate!: string | null;

  @ApiPropertyOptional({ nullable: true })
  grade!: string | null;

  @ApiPropertyOptional({ nullable: true })
  description!: string | null;

  @ApiPropertyOptional({ nullable: true })
  documentUrl!: string | null;

  @ApiProperty()
  isCompleted!: boolean;
}

export class EmployeeEducationResponseDto {
  @ApiProperty({ type: () => [EmployeeEducationItemResponseDto] })
  educations!: EmployeeEducationItemResponseDto[];

  @ApiProperty()
  status!: string;

  @ApiPropertyOptional({ nullable: true })
  hrFeedback!: string | null;
}

export class EmployeeFullEmploymentResponseDto {
  @ApiPropertyOptional({ nullable: true })
  employeeCode!: string | null;

  @ApiPropertyOptional({ nullable: true })
  departmentId!: string | null;

  @ApiPropertyOptional({ nullable: true })
  departmentName!: string | null;

  @ApiPropertyOptional({ nullable: true })
  positionId!: string | null;

  @ApiPropertyOptional({ nullable: true })
  positionTitle!: string | null;

  @ApiProperty()
  employmentType!: EmploymentType;

  @ApiPropertyOptional({ nullable: true })
  managerEmploymentId!: string | null;

  @ApiPropertyOptional({ nullable: true })
  hiredAt!: string | null;

  @ApiPropertyOptional({ nullable: true })
  probationEndAt!: string | null;

  @ApiPropertyOptional({ nullable: true })
  confirmedAt!: string | null;
}

export class EmployeeFullCompensationResponseDto {
  @ApiPropertyOptional({ nullable: true })
  baseSalary!: string | null;

  @ApiPropertyOptional({ nullable: true })
  currency!: string | null;

  @ApiProperty()
  payFrequency!: string;

  @ApiProperty()
  bonusEligible!: boolean;

  @ApiPropertyOptional({ nullable: true })
  bonusRate!: string | null;

  @ApiPropertyOptional({ nullable: true })
  effectiveFrom!: string | null;

  @ApiPropertyOptional({ nullable: true })
  effectiveTo!: string | null;
}

export class EmployeeFullLifecycleResponseDto {
  @ApiProperty()
  status!: LifecycleStatus;

  @ApiPropertyOptional({ nullable: true })
  onboardedAt!: string | null;

  @ApiPropertyOptional({ nullable: true })
  suspendedAt!: string | null;

  @ApiPropertyOptional({ nullable: true })
  terminatedAt!: string | null;

  @ApiProperty()
  offboardingCompleted!: boolean;
}

export class EmployeeFullResponseDto {
  @ApiProperty()
  id!: string;

  @ApiPropertyOptional({ nullable: true })
  userId!: string | null;

  @ApiPropertyOptional({ nullable: true })
  keycloakId!: string | null;

  @ApiPropertyOptional({ nullable: true })
  username!: string | null;

  @ApiPropertyOptional({ nullable: true })
  email!: string | null;

  @ApiPropertyOptional({ nullable: true })
  firstName!: string | null;

  @ApiPropertyOptional({ nullable: true })
  lastName!: string | null;

  @ApiPropertyOptional({ nullable: true })
  phone!: string | null;

  @ApiPropertyOptional({ nullable: true })
  userStatus!: string | null;

  @ApiProperty()
  employeeStatus!: EmployeeStatus;

  @ApiPropertyOptional({
    nullable: true,
    type: () => EmployeeFullProfileResponseDto,
  })
  profile!: EmployeeFullProfileResponseDto | null;

  @ApiPropertyOptional({
    nullable: true,
    type: () => EmployeeAddressResponseDto,
  })
  address!: EmployeeAddressResponseDto | null;

  @ApiPropertyOptional({
    nullable: true,
    type: () => EmployeeBankDetailResponseDto,
  })
  bankDetail!: EmployeeBankDetailResponseDto | null;

  @ApiPropertyOptional({
    nullable: true,
    type: () => EmployeeEmergencyContactsResponseDto,
  })
  emergencyContacts!: EmployeeEmergencyContactsResponseDto | null;

  @ApiPropertyOptional({
    nullable: true,
    type: () => EmployeeEducationResponseDto,
  })
  education!: EmployeeEducationResponseDto | null;

  @ApiPropertyOptional({
    nullable: true,
    type: () => EmployeeFullEmploymentResponseDto,
  })
  employment!: EmployeeFullEmploymentResponseDto | null;

  @ApiPropertyOptional({
    nullable: true,
    type: () => EmployeeFullCompensationResponseDto,
  })
  compensation!: EmployeeFullCompensationResponseDto | null;

  @ApiPropertyOptional({
    nullable: true,
    type: () => EmployeeFullLifecycleResponseDto,
  })
  lifecycle!: EmployeeFullLifecycleResponseDto | null;

  @ApiProperty()
  documentsCount!: number;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}
