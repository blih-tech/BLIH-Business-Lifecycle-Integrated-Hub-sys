import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

const normalizeBooleanValue = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') return value;
  if (value.trim().toLowerCase() === 'true') return true;
  if (value.trim().toLowerCase() === 'false') return false;
  return value;
};

// ─── Input DTOs ──────────────────────────────────────────────────────────────

export class PolicyAcknowledgementItemDto {
  @ApiPropertyOptional({ example: 'POL-001' })
  @IsOptional()
  @IsString()
  policyId?: string;

  @ApiPropertyOptional({ example: 'Code of Conduct' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'v2.0' })
  @IsOptional()
  @IsString()
  version?: string;

  @ApiPropertyOptional({ example: '2026-03-12T10:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  acknowledgedAt?: string;

  @ApiPropertyOptional({ example: '192.168.1.10' })
  @IsOptional()
  @IsString()
  ipAddress?: string;
}

export class CreatePolicyAcknowledgementDto {
  @ApiProperty({
    description: 'Employee UUID for policy acknowledgement.',
    example: 'employee-uuid',
  })
  @IsUUID()
  employeeId!: string;

  @ApiPropertyOptional({
    type: () => [PolicyAcknowledgementItemDto],
    description: 'List of policy acknowledgement items.',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PolicyAcknowledgementItemDto)
  policies?: PolicyAcknowledgementItemDto[];

  @ApiPropertyOptional({
    description: 'Whether all policies are acknowledged.',
    example: false,
  })
  @IsOptional()
  @Transform(normalizeBooleanValue)
  @IsBoolean()
  allAcknowledged?: boolean;

  @ApiPropertyOptional({
    description: 'Confirmation timestamp.',
    example: '2026-03-12T10:00:00.000Z',
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  confirmedAt?: string | null;
}

export class UpdatePolicyAcknowledgementDto extends PartialType(
  CreatePolicyAcknowledgementDto,
) {
  @ApiPropertyOptional({
    description: 'System access grant timestamp.',
    example: '2026-03-13T09:00:00.000Z',
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  systemAccessGrantedAt?: string | null;

  @ApiPropertyOptional({
    description: 'Verifier user UUID.',
    example: 'user-uuid',
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  verifiedById?: string | null;

  @ApiPropertyOptional({
    description: 'Verification timestamp.',
    example: '2026-03-12T12:00:00.000Z',
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  verifiedAt?: string | null;
}

// ─── Query DTO ───────────────────────────────────────────────────────────────

export class PolicyAcknowledgementListQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by employee UUID.',
    example: 'employee-uuid',
  })
  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @ApiPropertyOptional({
    description: 'Filter by verifier UUID.',
    example: 'user-uuid',
  })
  @IsOptional()
  @IsUUID()
  verifiedById?: string;

  @ApiPropertyOptional({
    description: 'Filter by allAcknowledged flag.',
    example: true,
  })
  @IsOptional()
  @Transform(normalizeBooleanValue)
  @IsBoolean()
  allAcknowledged?: boolean;

  @ApiPropertyOptional({
    default: 1,
    minimum: 1,
    description: 'Page index (1-based).',
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value as string, 10))
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    default: 20,
    minimum: 1,
    maximum: 100,
    description: 'Items per page.',
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value as string, 10))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

// ─── Response DTO ─────────────────────────────────────────────────────────────

export class PolicyAcknowledgementResponseDto {
  @ApiProperty({ example: 'policy-ack-uuid' })
  id!: string;

  @ApiProperty({ example: 'employee-uuid' })
  employeeId!: string;

  @ApiPropertyOptional({ description: 'Policies payload.', nullable: true })
  policies!: unknown;

  @ApiProperty({ example: false })
  allAcknowledged!: boolean;

  @ApiPropertyOptional({
    example: '2026-03-12T10:00:00.000Z',
    nullable: true,
  })
  confirmedAt!: string | null;

  @ApiPropertyOptional({
    example: '2026-03-13T09:00:00.000Z',
    nullable: true,
  })
  systemAccessGrantedAt!: string | null;

  @ApiPropertyOptional({ example: 'user-uuid', nullable: true })
  verifiedById!: string | null;

  @ApiPropertyOptional({
    example: '2026-03-12T12:00:00.000Z',
    nullable: true,
  })
  verifiedAt!: string | null;

  @ApiProperty({ example: '2026-03-11T14:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-03-11T14:00:00.000Z' })
  updatedAt!: string;
}
