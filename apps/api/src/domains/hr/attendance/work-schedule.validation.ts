import { BadRequestException } from '@nestjs/common';

type WorkScheduleDayInput = {
  dayOfWeek: string;
  isWorkingDay: boolean;
  startMinute?: number | null;
  endMinute?: number | null;
  expectedMinutes?: number | null;
  remoteAllowed?: boolean;
};

const VALID_DAYS = new Set([
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
]);

export function normalizeWorkScheduleDays(days: WorkScheduleDayInput[]) {
  if (!Array.isArray(days) || days.length === 0) {
    throw new BadRequestException(
      'Work schedules require at least one day rule',
    );
  }

  const seen = new Set<string>();

  return days.map((day) => {
    if (!VALID_DAYS.has(day.dayOfWeek)) {
      throw new BadRequestException(`Unsupported dayOfWeek: ${day.dayOfWeek}`);
    }
    if (seen.has(day.dayOfWeek)) {
      throw new BadRequestException(
        `Duplicate day configuration for ${day.dayOfWeek}`,
      );
    }
    seen.add(day.dayOfWeek);

    const startMinute = day.startMinute ?? null;
    const endMinute = day.endMinute ?? null;
    const expectedMinutes =
      day.expectedMinutes ??
      (startMinute != null && endMinute != null
        ? endMinute - startMinute
        : null);

    if (day.isWorkingDay) {
      if (startMinute == null || endMinute == null) {
        throw new BadRequestException(
          `${day.dayOfWeek} must define startMinute and endMinute when it is a working day`,
        );
      }
      if (startMinute < 0 || endMinute > 24 * 60 || endMinute <= startMinute) {
        throw new BadRequestException(
          `${day.dayOfWeek} has an invalid minute range`,
        );
      }
    }

    return {
      dayOfWeek: day.dayOfWeek as never,
      isWorkingDay: day.isWorkingDay,
      startMinute,
      endMinute,
      expectedMinutes,
      remoteAllowed: day.remoteAllowed ?? false,
    };
  });
}
