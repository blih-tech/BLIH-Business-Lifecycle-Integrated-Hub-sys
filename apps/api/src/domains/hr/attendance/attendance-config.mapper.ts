type WorkScheduleRow = {
  id: string;
  name: string;
  description: string | null;
  timezone: string | null;
  isDefault: boolean;
  lateThresholdMinutes: number;
  standardMinutesPerDay: number;
  createdAt: Date;
  updatedAt: Date;
  days: Array<{
    dayOfWeek: string;
    isWorkingDay: boolean;
    startMinute: number | null;
    endMinute: number | null;
    expectedMinutes: number | null;
    remoteAllowed: boolean;
  }>;
};

type HolidayRow = {
  id: string;
  name: string;
  date: Date;
  countryId: string | null;
  isRecurringAnnual: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type UserWorkScheduleRow = {
  id: string;
  employeeId: string;
  scheduleId: string;
  effectiveFrom: Date;
  effectiveTo: Date | null;
  createdAt: Date;
  updatedAt: Date;
  schedule: {
    name: string;
  };
};

export function mapWorkScheduleResponse(row: WorkScheduleRow) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    timezone: row.timezone,
    isDefault: row.isDefault,
    lateThresholdMinutes: row.lateThresholdMinutes,
    standardMinutesPerDay: row.standardMinutesPerDay,
    days: row.days
      .slice()
      .sort((left, right) => left.dayOfWeek.localeCompare(right.dayOfWeek))
      .map((day) => ({
        dayOfWeek: day.dayOfWeek,
        isWorkingDay: day.isWorkingDay,
        startMinute: day.startMinute,
        endMinute: day.endMinute,
        expectedMinutes: day.expectedMinutes,
        remoteAllowed: day.remoteAllowed,
      })),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapHolidayResponse(row: HolidayRow) {
  return {
    id: row.id,
    name: row.name,
    date: row.date.toISOString().slice(0, 10),
    countryId: row.countryId,
    isRecurringAnnual: row.isRecurringAnnual,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapUserWorkScheduleResponse(row: UserWorkScheduleRow) {
  return {
    id: row.id,
    employeeId: row.employeeId,
    scheduleId: row.scheduleId,
    effectiveFrom: row.effectiveFrom.toISOString().slice(0, 10),
    effectiveTo: row.effectiveTo?.toISOString().slice(0, 10) ?? null,
    scheduleName: row.schedule.name,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
