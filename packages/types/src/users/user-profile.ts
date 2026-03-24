export type EmploymentType =
  | 'FULL_TIME'
  | 'PART_TIME'
  | 'CONTRACT'
  | 'INTERN'
  | 'TEMPORARY';

/** Const array for validation/Swagger (shared with recruitment job DTOs) */
export const EMPLOYMENT_TYPES = [
  'FULL_TIME',
  'PART_TIME',
  'CONTRACT',
  'INTERN',
  'TEMPORARY',
] as const;

export type PayFrequency = 'MONTHLY' | 'BIWEEKLY' | 'WEEKLY' | 'ANNUAL';
export const PAY_FREQUENCIES = [
  'MONTHLY',
  'BIWEEKLY',
  'WEEKLY',
  'ANNUAL',
] as const;

export type CompensationComponentType =
  | 'ALLOWANCE'
  | 'BONUS'
  | 'DEDUCTION'
  | 'BENEFIT';

export type LifecycleStatus =
  | 'ONBOARDING'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'ON_LEAVE'
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
  positionId?: string | null;
  employmentType?: EmploymentType;
  managerEmploymentId?: string | null;
  hiredAt?: string;
  probationEndAt?: string;
  confirmedAt?: string;
  changeReason?: string;
  changedById?: string | null;
}

export interface UserEmploymentResponseDto {
  userId: string;
  employeeCode?: string | null;
  departmentId?: string | null;
  departmentName?: string | null;
  positionId?: string | null;
  positionTitle?: string | null;
  jobGradeId?: string | null;
  jobGradeCode?: string | null;
  jobGradeName?: string | null;
  jobGradeLevel?: number | null;
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
  components?: CompensationComponentResponseDto[];
  summary?: {
    currency: string | null;
    annualBaseSalary: number;
    periodBaseSalary: number;
    recurringAnnualComponents: number;
    recurringPeriodComponents: number;
    oneTimeComponentsTotal: number;
    estimatedAnnualBonus: number | null;
    totalAnnualCompensation: number;
    totalPeriodCompensation: number;
  } | null;
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

export interface CreateCompensationComponentDto {
  name: string;
  type: CompensationComponentType;
  amount: string;
  isRecurring: boolean;
  effectiveFrom: string;
  effectiveTo?: string | null;
}

export interface UpdateCompensationComponentDto {
  name?: string;
  type?: CompensationComponentType;
  amount?: string;
  isRecurring?: boolean;
  effectiveFrom?: string;
  effectiveTo?: string | null;
}

export interface CompensationComponentResponseDto {
  id: string;
  userId: string;
  name: string;
  type: CompensationComponentType;
  amount: string;
  isRecurring: boolean;
  effectiveFrom: string;
  effectiveTo: string | null;
  createdAt: string;
  updatedAt: string;
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
