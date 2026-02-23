import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Meta block for success/error envelope (timestamp, requestId, version, optional pagination).
 * Used to document that all 2xx responses are wrapped in an envelope.
 */
export class ApiSuccessEnvelopeMetaDto {
  @ApiProperty({ example: '2026-02-20T12:00:00.000Z' })
  timestamp!: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  requestId!: string;

  @ApiProperty({ example: 'v1' })
  version!: string;

  @ApiPropertyOptional({
    description: 'Present for paginated list responses.',
    example: {
      page: 1,
      limit: 10,
      totalItems: 100,
      totalPages: 10,
      hasNextPage: true,
      hasPreviousPage: false,
    },
  })
  pagination?: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * Success response envelope: all successful responses have this shape.
 * Controllers return the resource; the interceptor wraps it as data.
 */
export class ApiSuccessEnvelopeDto<T = unknown> {
  @ApiProperty({ example: true })
  success!: true;

  @ApiProperty({ example: 'Request processed successfully' })
  message!: string;

  @ApiProperty({
    nullable: true,
    type: () => Object,
    description: 'Response payload.',
  })
  data!: T | null;

  @ApiProperty({ example: null, nullable: true })
  error!: null;

  @ApiProperty({ type: () => ApiSuccessEnvelopeMetaDto })
  meta!: ApiSuccessEnvelopeMetaDto;
}
