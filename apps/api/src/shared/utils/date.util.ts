export const nowIso = (): string => new Date().toISOString();

export const addDays = (days: number, from = new Date()): Date => {
  const next = new Date(from);
  next.setDate(next.getDate() + days);
  return next;
};
