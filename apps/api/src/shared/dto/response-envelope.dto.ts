import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** API version for meta (e.g. "v1"). */
export const API_VERSION = 'v1';

/** Standard error codes for the response envelope (aligned with HTTP and validation). */
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  METHOD_NOT_ALLOWED = 'METHOD_NOT_ALLOWED',
  UNPROCESSABLE_ENTITY = 'UNPROCESSABLE_ENTITY',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  BAD_GATEWAY = 'BAD_GATEWAY',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  GATEWAY_TIMEOUT = 'GATEWAY_TIMEOUT',
}

/** Default success message when no per-route message is set. */
export const DEFAULT_SUCCESS_MESSAGE = 'Request processed successfully';

export interface ApiResponseFieldError {
  field: string;
  message: string;
}

export interface ApiResponseError {
  code: string;
  details?: string;
  fieldErrors?: ApiResponseFieldError[];
}

export interface ApiResponsePaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApiResponseMeta {
  timestamp: string;
  requestId: string;
  version: string;
  pagination?: ApiResponsePaginationMeta;
}

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T | null;
  error: ApiResponseError | null;
  meta: ApiResponseMeta;
};

export interface PaginationInput {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/** Pagination info in envelope meta (uses totalItems per spec). */
export class ResponseEnvelopePaginationDto implements ApiResponsePaginationMeta {
  @ApiProperty({ example: 1, description: 'Current page index (1-based).' })
  page!: number;

  @ApiProperty({ example: 10, description: 'Page size.' })
  limit!: number;

  @ApiProperty({ example: 100, description: 'Total number of items.' })
  totalItems!: number;

  @ApiProperty({ example: 10, description: 'Total number of pages.' })
  totalPages!: number;

  @ApiProperty({
    example: true,
    description: 'True when a next page exists.',
  })
  hasNextPage!: boolean;

  @ApiProperty({
    example: false,
    description: 'True when a previous page exists.',
  })
  hasPreviousPage!: boolean;
}

/** Meta block: timestamp, requestId, version, optional pagination. */
export class ResponseEnvelopeMetaDto implements ApiResponseMeta {
  @ApiProperty({
    description: 'ISO-8601 timestamp of the response.',
    example: '2026-02-20T12:00:00.000Z',
  })
  timestamp!: string;

  @ApiProperty({
    description: 'Request/correlation ID for tracing.',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  requestId!: string;

  @ApiProperty({
    description: 'API version.',
    example: 'v1',
  })
  version!: string;

  @ApiPropertyOptional({
    description: 'Pagination info when response is a list.',
    type: () => ResponseEnvelopePaginationDto,
  })
  pagination?: ResponseEnvelopePaginationDto;
}

/** Single field error (validation). */
export class ResponseEnvelopeFieldErrorDto implements ApiResponseFieldError {
  @ApiProperty({ example: 'email', description: 'Field name.' })
  field!: string;

  @ApiProperty({
    example: 'Invalid email format',
    description: 'Error message.',
  })
  message!: string;
}

/** Error payload in envelope (code, details, optional fieldErrors). */
export class ResponseEnvelopeErrorDto implements ApiResponseError {
  @ApiProperty({
    description: 'Error code.',
    example: ErrorCode.VALIDATION_ERROR,
    enum: ErrorCode,
  })
  code!: ErrorCode | string;

  @ApiPropertyOptional({
    description: 'Human-readable error details.',
    example: 'One or more fields are invalid',
  })
  details?: string;

  @ApiPropertyOptional({
    description: 'Per-field validation errors.',
    type: () => [ResponseEnvelopeFieldErrorDto],
  })
  fieldErrors?: ResponseEnvelopeFieldErrorDto[];
}

/** Success response envelope: success, message, data, error=null, meta. */
export class ResponseEnvelopeSuccessDto<T = unknown> implements ApiResponse<T> {
  @ApiProperty({ example: true })
  success!: true;

  @ApiProperty({ example: 'Request processed successfully' })
  message!: string;

  @ApiProperty({
    nullable: true,
    type: () => Object,
    description: 'Response payload. Null when no payload is returned.',
  })
  data!: T | null;

  @ApiProperty({ example: null, nullable: true })
  error!: null;

  @ApiProperty({ type: () => ResponseEnvelopeMetaDto })
  meta!: ResponseEnvelopeMetaDto;
}

/** Error response envelope: success, message, data=null, error, meta. */
export class ResponseEnvelopeErrorResponseDto implements ApiResponse<null> {
  @ApiProperty({ example: false })
  success!: false;

  @ApiProperty({ example: 'Validation failed' })
  message!: string;

  @ApiProperty({
    example: null,
    nullable: true,
    type: () => Object,
    description: 'Always null on error.',
  })
  data!: null;

  @ApiProperty({ type: () => ResponseEnvelopeErrorDto })
  error!: ResponseEnvelopeErrorDto;

  @ApiProperty({ type: () => ResponseEnvelopeMetaDto })
  meta!: ResponseEnvelopeMetaDto;
}

/** Build meta object for envelope (timestamp, requestId, version, optional pagination). */
export function buildEnvelopeMeta(
  requestId: string,
  pagination?: PaginationInput,
): ResponseEnvelopeMetaDto {
  const meta: ResponseEnvelopeMetaDto = {
    timestamp: new Date().toISOString(),
    requestId,
    version: API_VERSION,
  };
  if (pagination) {
    meta.pagination = {
      page: pagination.page,
      limit: pagination.limit,
      totalItems: pagination.total,
      totalPages: pagination.totalPages,
      hasNextPage:
        pagination.hasNextPage ?? pagination.page < pagination.totalPages,
      hasPreviousPage: pagination.hasPreviousPage ?? pagination.page > 1,
    };
  }
  return meta;
}

/** Build success envelope. */
export function buildSuccessEnvelope<T>(
  data: T | null,
  requestId: string,
  message = DEFAULT_SUCCESS_MESSAGE,
  pagination?: PaginationInput,
): ResponseEnvelopeSuccessDto<T> {
  return {
    success: true,
    message,
    data: data ?? null,
    error: null,
    meta: buildEnvelopeMeta(requestId, pagination),
  };
}

/** Build error envelope (for use in exception filter). */
export function buildErrorEnvelope(
  message: string,
  code: ErrorCode | string,
  requestId: string,
  details?: string,
  fieldErrors?: ApiResponseFieldError[],
): ResponseEnvelopeErrorResponseDto {
  const error: ResponseEnvelopeErrorDto = {
    code,
    ...(details !== undefined && { details }),
    ...(fieldErrors !== undefined && fieldErrors.length > 0 && { fieldErrors }),
  };
  return {
    success: false,
    message,
    data: null,
    error,
    meta: buildEnvelopeMeta(requestId),
  };
}
