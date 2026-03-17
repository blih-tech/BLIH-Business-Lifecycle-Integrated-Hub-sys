import type { EmploymentType, LifecycleStatus } from '../users/index.js';

export interface ListEmployeesQueryDto {
  departmentId?: string;
  lifecycleStatus?: LifecycleStatus;
  employmentType?: EmploymentType;
  search?: string;
  page?: number;
  limit?: number;
}

export interface EmployeeListItemDto {
  id: string;
  userId: string | null;
  keycloakId: string | null;
  username: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  status: string | null;
  departmentId: string | null;
  departmentName: string | null;
  employeeCode: string | null;
  positionId: string | null;
  positionTitle: string | null;
  employmentType: EmploymentType;
  lifecycleStatus: LifecycleStatus | null;
  hiredAt: string | null;
  createdAt: string;
}

export interface EmployeeFullResponseDto {
  id: string;
  userId: string | null;
  keycloakId: string | null;
  username: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  status: string | null;
  departmentId: string | null;
  departmentName: string | null;
  profile: {
    dateOfBirth: string | null;
    gender: string | null;
    nationalityId: string | null;
    nationalityName: string | null;
    maritalStatus: string | null;
    addressLine1: string | null;
    addressLine2: string | null;
    city: string | null;
    state: string | null;
    countryId: string | null;
    countryName: string | null;
    postalCode: string | null;
    emergencyContactName: string | null;
    emergencyContactPhone: string | null;
  } | null;
  employment: {
    employeeCode: string | null;
    departmentId: string | null;
    departmentName: string | null;
    positionId: string | null;
    positionTitle: string | null;
    employmentType: EmploymentType;
    managerEmploymentId: string | null;
    hiredAt: string | null;
    probationEndAt: string | null;
    confirmedAt: string | null;
  } | null;
  compensation: {
    baseSalary: string | null;
    currency: string | null;
    payFrequency: string;
    bonusEligible: boolean;
    bonusRate: string | null;
    effectiveFrom: string | null;
    effectiveTo: string | null;
    summary: {
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
  } | null;
  lifecycle: {
    status: LifecycleStatus;
    onboardedAt: string | null;
    suspendedAt: string | null;
    terminatedAt: string | null;
    offboardingCompleted: boolean;
  } | null;
  documentsCount: number;
  contractsCount: number;
  createdAt: string;
  updatedAt: string;
}
