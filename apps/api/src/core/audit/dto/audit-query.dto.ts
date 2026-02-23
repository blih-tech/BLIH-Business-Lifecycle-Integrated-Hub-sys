import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AuditQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by action key.',
    example: 'user.update',
  })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiPropertyOptional({
    description: 'Filter by module name.',
    example: 'system.user',
  })
  @IsOptional()
  @IsString()
  module?: string;

  @ApiPropertyOptional({
    description: 'Filter by actor user id.',
    example: '40b5c2fb-7a2f-4af2-ac03-fad1bb3fe061',
  })
  @IsOptional()
  @IsString()
  actorUserId?: string;

  @ApiPropertyOptional({
    description: 'Filter by result status.',
    enum: ['SUCCESS', 'FAILURE'],
    example: 'FAILURE',
  })
  @IsOptional()
  @IsString()
  @IsIn(['SUCCESS', 'FAILURE'])
  result?: 'SUCCESS' | 'FAILURE';

  @ApiPropertyOptional({
    description: 'Filter by HTTP status code.',
    minimum: 100,
    maximum: 599,
    example: 403,
  })
  @IsOptional()
  @IsInt()
  @Min(100)
  @Max(599)
  statusCode?: number;

  @ApiPropertyOptional({
    description: 'Inclusive start date-time for time range filter.',
    format: 'date-time',
    example: '2026-02-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({
    description: 'Inclusive end date-time for time range filter.',
    format: 'date-time',
    example: '2026-02-15T23:59:59.999Z',
  })
  @IsOptional()
  @IsDateString()
  to?: string;
}
