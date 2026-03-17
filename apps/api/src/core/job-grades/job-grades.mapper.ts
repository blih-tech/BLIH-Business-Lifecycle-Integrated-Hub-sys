type JobGradeRow = {
  id: string;
  code: string;
  name: string;
  level: number;
  minSalary: unknown;
  maxSalary: unknown;
  createdAt: Date;
  updatedAt: Date;
};

function toNumberOrNull(value: unknown): number | null {
  if (value == null) {
    return null;
  }
  if (
    typeof value === 'object' &&
    value !== null &&
    'toNumber' in (value as object)
  ) {
    return (value as { toNumber: () => number }).toNumber();
  }
  return Number(value);
}

export const mapJobGrade = (jobGrade: JobGradeRow) => ({
  id: jobGrade.id,
  code: jobGrade.code,
  name: jobGrade.name,
  level: jobGrade.level,
  minSalary: toNumberOrNull(jobGrade.minSalary),
  maxSalary: toNumberOrNull(jobGrade.maxSalary),
  createdAt: jobGrade.createdAt.toISOString(),
  updatedAt: jobGrade.updatedAt.toISOString(),
});
