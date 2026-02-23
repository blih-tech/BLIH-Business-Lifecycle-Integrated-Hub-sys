export const asBoolean = (
  value: string | undefined,
  fallback = false,
): boolean => {
  if (value === undefined) {
    return fallback;
  }
  return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
};

export const asNumber = (
  value: string | undefined,
  fallback: number,
): number => {
  if (value === undefined) {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};
