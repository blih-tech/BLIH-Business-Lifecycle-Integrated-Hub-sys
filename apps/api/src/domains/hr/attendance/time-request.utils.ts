import { BadRequestException } from '@nestjs/common';
import { normalizeDateOnly } from './attendance-date.util';

export function buildRequestId(prefix: string, year: number, sequence: number) {
  return `${prefix}-${year}-${String(sequence).padStart(4, '0')}`;
}

export function parseOptionalDateTime(value: string | null | undefined) {
  if (value === undefined) return undefined;
  return value ? new Date(value) : null;
}

export function validateDateRange(start: Date, end: Date, maxDays = 31) {
  if (end.getTime() < start.getTime()) {
    throw new BadRequestException('endDate must be on or after startDate');
  }

  const startOnly = normalizeDateOnly(start);
  const endOnly = normalizeDateOnly(end);
  const diffDays =
    Math.round((endOnly.getTime() - startOnly.getTime()) / 86400000) + 1;
  if (diffDays > maxDays) {
    throw new BadRequestException(
      `Request range cannot exceed ${maxDays} days`,
    );
  }
}

export function validateMinuteWindow(
  startMinute: number | null | undefined,
  endMinute: number | null | undefined,
) {
  if (startMinute == null && endMinute == null) {
    return;
  }
  if (startMinute == null || endMinute == null) {
    throw new BadRequestException(
      'Both requestedStartMinute and requestedEndMinute are required together',
    );
  }
  if (
    startMinute < 0 ||
    startMinute > 1439 ||
    endMinute < 0 ||
    endMinute > 1439
  ) {
    throw new BadRequestException('Requested minutes must be within 0-1439');
  }
  if (endMinute <= startMinute) {
    throw new BadRequestException(
      'requestedEndMinute must be greater than requestedStartMinute',
    );
  }
}

export function assertDraftOrPending(status: string, entityName: string) {
  if (!['DRAFT', 'PENDING'].includes(status)) {
    throw new BadRequestException(
      `${entityName} can only be changed while draft or pending`,
    );
  }
}

export function assertPending(status: string, entityName: string) {
  if (status !== 'PENDING') {
    throw new BadRequestException(
      `Only pending ${entityName} can be processed`,
    );
  }
}

export function assertCancellable(status: string, entityName: string) {
  if (!['DRAFT', 'PENDING', 'APPROVED'].includes(status)) {
    throw new BadRequestException(`Only active ${entityName} can be cancelled`);
  }
}
