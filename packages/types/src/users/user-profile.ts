export type EmploymentType =
  | 'FULL_TIME'
  | 'PART_TIME'
  | 'CONTRACT'
  | 'INTERN'
  | 'TEMPORARY';

export type PayFrequency = 'MONTHLY' | 'BIWEEKLY' | 'WEEKLY' | 'ANNUAL';

export type LifecycleStatus =
  | 'ONBOARDING'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'TERMINATED'
  | 'RESIGNED'
  | 'RETIRED';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';

export type MaritalStatus =
  | 'SINGLE'
  | 'MARRIED'
  | 'DIVORCED'
  | 'WIDOWED'
  | 'SEPARATED';

export interface UpdateUserProfileDto {
  dateOfBirth?: string;
  gender?: Gender;
  nationalityId?: string | null;
  maritalStatus?: MaritalStatus;
  avatarUrl?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  countryId?: string | null;
  postalCode?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export interface UserProfileResponseDto {
  userId: string;
  dateOfBirth?: string | null;
  gender?: Gender | null;
  nationalityId?: string | null;
  nationality?: string | null;
  maritalStatus?: MaritalStatus | null;
  avatarUrl?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  countryId?: string | null;
  country?: string | null;
  postalCode?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserEmploymentDto {
  employeeCode?: string;
  jobTitle?: string;
  employmentType?: EmploymentType;
  managerEmploymentId?: string | null;
  hiredAt?: string;
  probationEndAt?: string;
  confirmedAt?: string;
}

export interface UserEmploymentResponseDto {
  userId: string;
  employeeCode?: string | null;
  jobTitle?: string | null;
  employmentType: EmploymentType;
  managerEmploymentId?: string | null;
  hiredAt?: string | null;
  probationEndAt?: string | null;
  confirmedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserCompensationDto {
  baseSalary?: string;
  currency?: string;
  payFrequency?: PayFrequency;
  bonusEligible?: boolean;
  bonusRate?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  changeReason?: string;
  changedById?: string;
}

export interface UserCompensationResponseDto {
  userId: string;
  baseSalary?: string | null;
  currency?: string | null;
  payFrequency: PayFrequency;
  bonusEligible: boolean;
  bonusRate?: string | null;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCompensationHistoryDto {
  baseSalary?: string;
  currency?: string;
  payFrequency?: PayFrequency;
  bonusEligible?: boolean;
  bonusRate?: string;
  validFrom: string;
  validTo?: string;
  changeReason?: string;
  changedById?: string;
}

export interface UserCompensationHistoryResponseDto {
  id: string;
  userId: string;
  baseSalary?: string | null;
  currency?: string | null;
  payFrequency: PayFrequency;
  bonusEligible: boolean;
  bonusRate?: string | null;
  validFrom: string;
  validTo?: string | null;
  changeReason?: string | null;
  changedById?: string | null;
  createdAt: string;
}

export interface UpdateUserLifecycleDto {
  status?: LifecycleStatus;
  onboardedAt?: string;
  suspendedAt?: string;
  terminatedAt?: string;
  terminationReason?: string;
  offboardingCompleted?: boolean;
}

export interface UserLifecycleResponseDto {
  userId: string;
  status: LifecycleStatus;
  onboardedAt?: string | null;
  suspendedAt?: string | null;
  terminatedAt?: string | null;
  terminationReason?: string | null;
  offboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}
