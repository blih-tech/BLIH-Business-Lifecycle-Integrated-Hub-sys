const DAY_OF_WEEK = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
] as const;

export function normalizeDateOnly(value: Date | string): Date {
  const date =
    typeof value === 'string'
      ? new Date(value.includes('T') ? value : `${value.trim()}T00:00:00.000Z`)
      : value;

  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

export function formatDateOnly(value: Date): string {
  return normalizeDateOnly(value).toISOString().slice(0, 10);
}

export function addUtcDays(value: Date, days: number): Date {
  const date = normalizeDateOnly(value);
  date.setUTCDate(date.getUTCDate() + days);
  return date;
}

export function enumerateDateRange(start: Date, end: Date): Date[] {
  const dates: Date[] = [];
  let cursor = normalizeDateOnly(start);
  const limit = normalizeDateOnly(end);

  while (cursor.getTime() <= limit.getTime()) {
    dates.push(new Date(cursor));
    cursor = addUtcDays(cursor, 1);
  }

  return dates;
}

export function getDayOfWeek(value: Date) {
  return DAY_OF_WEEK[normalizeDateOnly(value).getUTCDay()];
}

export function buildUtcDateTime(date: Date, minuteOfDay: number): Date {
  const normalized = normalizeDateOnly(date);
  const hours = Math.floor(minuteOfDay / 60);
  const minutes = minuteOfDay % 60;

  return new Date(
    Date.UTC(
      normalized.getUTCFullYear(),
      normalized.getUTCMonth(),
      normalized.getUTCDate(),
      hours,
      minutes,
      0,
      0,
    ),
  );
}
