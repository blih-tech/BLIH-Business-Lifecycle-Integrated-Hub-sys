import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ErrorCode } from '../../../dto/response-envelope.dto';

/** Per-field validation error for OpenAPI docs. */
export class ApiErrorFieldErrorDto {
  @ApiProperty({ example: 'email' })
  field!: string;

  @ApiProperty({ example: 'Invalid email format' })
  message!: string;
}

/** Error payload (code, details, optional fieldErrors) for OpenAPI docs. */
export class ApiErrorPayloadDto {
  @ApiProperty({
    example: ErrorCode.VALIDATION_ERROR,
    enum: ErrorCode,
  })
  code!: ErrorCode | string;

  @ApiPropertyOptional({ example: 'One or more fields are invalid' })
  details?: string;

  @ApiPropertyOptional({
    type: () => [ApiErrorFieldErrorDto],
    description: 'Per-field validation errors (400/VALIDATION_ERROR).',
  })
  fieldErrors?: ApiErrorFieldErrorDto[];
}

/** Meta (timestamp, requestId, version) for OpenAPI docs. */
export class ApiErrorMetaDto {
  @ApiProperty({ example: '2026-02-20T12:00:00.000Z' })
  timestamp!: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  requestId!: string;

  @ApiProperty({ example: 'v1' })
  version!: string;
}

/**
 * Documented error response: envelope with success=false, message, data=null, error, meta.
 * Matches the actual API error shape from HttpExceptionFilter.
 */
export class ApiErrorResponseDto {
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

  @ApiProperty({ type: () => ApiErrorPayloadDto })
  error!: ApiErrorPayloadDto;

  @ApiProperty({ type: () => ApiErrorMetaDto })
  meta!: ApiErrorMetaDto;
}
