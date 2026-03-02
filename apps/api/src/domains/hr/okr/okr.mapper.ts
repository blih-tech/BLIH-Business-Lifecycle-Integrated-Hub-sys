import type {
  KeyResultResponseDto,
  KeyResultUpdateResponseDto,
  OkrProgressResponseDto,
  OkrResponseDto,
} from '@repo/types';

type KeyResultRow = {
  id: string;
  okrId: string;
  title: string;
  type: string;
  targetValue: unknown;
  currentValue: unknown;
  progress: number;
  status: string;
  weight: number;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

type KeyResultUpdateRow = {
  id: string;
  keyResultId: string;
  previousValue: unknown;
  newValue: unknown;
  comment: string | null;
  updatedById: string;
  createdAt: Date;
};

type OkrRow = {
  id: string;
  userId: string | null;
  scope: string;
  departmentId: string | null;
  department?: {
    name: string;
  } | null;
  parentOkrId: string | null;
  periodYear: number;
  periodQuarter: number;
  title: string;
  description: string | null;
  status: string;
  overallProgress: number;
  overallStatus: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
  keyResults?: KeyResultRow[];
};

function dec(value: unknown): number {
  if (value == null) return 0;
  if (
    typeof value === 'object' &&
    value !== null &&
    'toNumber' in (value as object)
  ) {
    return (value as { toNumber: () => number }).toNumber();
  }
  return Number(value);
}

export function mapKeyResultResponse(row: KeyResultRow): KeyResultResponseDto {
  return {
    id: row.id,
    okrId: row.okrId,
    title: row.title,
    type: row.type as KeyResultResponseDto['type'],
    targetValue: dec(row.targetValue),
    currentValue: row.currentValue != null ? dec(row.currentValue) : null,
    progress: row.progress,
    status: row.status as KeyResultResponseDto['status'],
    weight: row.weight,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapKeyResultUpdateResponse(
  row: KeyResultUpdateRow,
): KeyResultUpdateResponseDto {
  return {
    id: row.id,
    keyResultId: row.keyResultId,
    previousValue: row.previousValue != null ? dec(row.previousValue) : null,
    newValue: dec(row.newValue),
    comment: row.comment,
    updatedById: row.updatedById,
    createdAt: row.createdAt.toISOString(),
  };
}

export function mapOkrResponse(row: OkrRow): OkrResponseDto {
  return {
    id: row.id,
    userId: row.userId,
    scope: row.scope as OkrResponseDto['scope'],
    departmentId: row.departmentId,
    departmentName: row.department?.name ?? null,
    parentOkrId: row.parentOkrId,
    periodYear: row.periodYear,
    periodQuarter: row.periodQuarter,
    title: row.title,
    description: row.description,
    status: row.status as OkrResponseDto['status'],
    overallProgress: row.overallProgress,
    overallStatus: row.overallStatus as OkrResponseDto['overallStatus'],
    startDate: row.startDate.toISOString().slice(0, 10),
    endDate: row.endDate.toISOString().slice(0, 10),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    keyResults: row.keyResults?.map(mapKeyResultResponse),
  };
}

export function mapOkrProgressResponse(
  okrId: string,
  overallProgress: number,
  overallStatus: string,
  keyResults: Array<{
    id: string;
    title: string;
    progress: number;
    status: string;
    weight: number;
  }>,
): OkrProgressResponseDto {
  return {
    okrId,
    overallProgress,
    overallStatus: overallStatus as OkrProgressResponseDto['overallStatus'],
    keyResults: keyResults.map((keyResult) => ({
      id: keyResult.id,
      title: keyResult.title,
      progress: keyResult.progress,
      status:
        keyResult.status as OkrProgressResponseDto['keyResults'][0]['status'],
      weight: keyResult.weight,
    })),
  };
}
