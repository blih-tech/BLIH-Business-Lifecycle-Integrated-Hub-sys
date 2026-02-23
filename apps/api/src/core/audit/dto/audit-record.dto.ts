import {
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuditRecordDto {
  @ApiProperty({
    description: 'Action key representing audited activity.',
    example: 'user.update',
  })
  @IsString()
  action!: string;

  @ApiProperty({
    description: 'Origin module.',
    example: 'system.user',
  })
  @IsString()
  module!: string;

  @ApiProperty({
    description: 'Resource category.',
    example: 'user',
  })
  @IsString()
  resource!: string;

  @ApiPropertyOptional({
    description: 'Resource id impacted by the action.',
    example: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374',
  })
  @IsOptional()
  @IsString()
  resourceId?: string;

  @ApiPropertyOptional({
    description: 'Actor user id.',
    example: '40b5c2fb-7a2f-4af2-ac03-fad1bb3fe061',
  })
  @IsOptional()
  @IsString()
  actorUserId?: string;

  @ApiPropertyOptional({
    description: 'Actor email address.',
    example: 'admin@blih.local',
  })
  @IsOptional()
  @IsString()
  actorEmail?: string;

  @ApiProperty({
    description: 'Request correlation request id.',
    example: 'req-4fda5e87cd',
  })
  @IsString()
  requestId!: string;

  @ApiProperty({
    description: 'Cross-service correlation id.',
    example: 'corr-5dfe12fce',
  })
  @IsString()
  correlationId!: string;

  @ApiProperty({
    description: 'Client IP address.',
    example: '10.0.10.14',
  })
  @IsString()
  ipAddress!: string;

  @ApiProperty({
    description: 'Client user-agent string.',
    example: 'Mozilla/5.0',
  })
  @IsString()
  userAgent!: string;

  @ApiPropertyOptional({
    description: 'Action result.',
    enum: ['SUCCESS', 'FAILURE'],
    example: 'SUCCESS',
  })
  @IsOptional()
  @IsString()
  @IsIn(['SUCCESS', 'FAILURE'])
  result?: 'SUCCESS' | 'FAILURE';

  @ApiPropertyOptional({
    description: 'HTTP status code associated with the action.',
    minimum: 100,
    maximum: 599,
    example: 200,
  })
  @IsOptional()
  @IsInt()
  @Min(100)
  @Max(599)
  statusCode?: number;

  @ApiPropertyOptional({
    description: 'State snapshot before mutation.',
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  before?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'State snapshot after mutation.',
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  after?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Supplementary metadata.',
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
