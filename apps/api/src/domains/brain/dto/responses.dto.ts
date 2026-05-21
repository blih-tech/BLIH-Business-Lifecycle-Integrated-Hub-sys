import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseMetaDto {
  @ApiProperty({
    description: 'Response timestamp',
    example: '2026-03-26T09:21:00.000Z',
  })
  timestamp!: string;

  @ApiProperty({
    description: 'Unique request ID for tracing',
    example: 'req_123456789',
  })
  requestId!: string;

  @ApiProperty({
    description: 'API version',
    example: 'v1',
  })
  version!: string;
}

export class ApiErrorDetailDto {
  @ApiProperty({
    description: 'Error field',
    example: 'userId',
  })
  field?: string;

  @ApiProperty({
    description: 'Error message',
    example: 'User ID is required',
  })
  message!: string;
}

export class ApiErrorDto {
  @ApiProperty({
    description: 'Error code',
    example: 'VALIDATION_ERROR',
  })
  code!: string;

  @ApiProperty({
    description: 'Error details',
    example: 'Validation failed',
  })
  details!: string;

  @ApiProperty({
    description: 'Field-specific errors',
    type: [ApiErrorDetailDto],
    required: false,
  })
  fieldErrors?: ApiErrorDetailDto[];
}

export class ApiResponseDto<T> {
  @ApiProperty({
    description: 'Indicates if the request was successful',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Request processed successfully',
  })
  message!: string;

  @ApiProperty({
    description: 'Response data',
    required: false,
  })
  data!: T;

  @ApiProperty({
    description: 'Error details if request failed',
    type: ApiErrorDto,
    required: false,
  })
  error?: ApiErrorDto;

  @ApiProperty({
    description: 'Response metadata',
    type: ApiResponseMetaDto,
    required: false,
  })
  meta?: ApiResponseMetaDto;
}
