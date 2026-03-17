export type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

export interface WorkScheduleDayDto {
  dayOfWeek: DayOfWeek;
  isWorkingDay: boolean;
  startMinute?: number | null;
  endMinute?: number | null;
  expectedMinutes?: number | null;
  remoteAllowed?: boolean;
}

export interface CreateWorkScheduleDto {
  name: string;
  description?: string | null;
  timezone?: string | null;
  isDefault?: boolean;
  lateThresholdMinutes?: number;
  standardMinutesPerDay?: number;
  days: WorkScheduleDayDto[];
}

export interface UpdateWorkScheduleDto {
  name?: string;
  description?: string | null;
  timezone?: string | null;
  isDefault?: boolean;
  lateThresholdMinutes?: number;
  standardMinutesPerDay?: number;
  days?: WorkScheduleDayDto[];
}

export interface WorkScheduleResponseDto {
  id: string;
  name: string;
  description: string | null;
  timezone: string | null;
  isDefault: boolean;
  lateThresholdMinutes: number;
  standardMinutesPerDay: number;
  days: WorkScheduleDayDto[];
  createdAt: string;
  updatedAt: string;
}

export interface AssignUserWorkScheduleDto {
  employeeId: string;
  scheduleId: string;
  effectiveFrom: string;
  effectiveTo?: string | null;
}

export interface UserWorkScheduleResponseDto {
  id: string;
  employeeId: string;
  scheduleId: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  scheduleName: string;
  createdAt: string;
  updatedAt: string;
}
