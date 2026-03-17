import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
  IsObject,
} from 'class-validator';

export const ASSET_PROVISIONING_STATUSES = [
  'PENDING',
  'APPROVED',
  'PROVISIONED',
  'REJECTED',
  'COMPLETED',
] as const;
export type AssetProvisioningStatusValue =
  (typeof ASSET_PROVISIONING_STATUSES)[number];

const normalizeEnumValue = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') return value;
  return value
    .trim()
    .replace(/[\s-]+/g, '_')
    .toUpperCase();
};

const normalizeBooleanValue = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') return value;
  if (value.trim().toLowerCase() === 'true') return true;
  if (value.trim().toLowerCase() === 'false') return false;
  return value;
};

// ─── Input DTOs ──────────────────────────────────────────────────────────────

export class AssetProvisioningEquipmentItemDto {
  @ApiPropertyOptional({ example: 'Laptop' })
  @IsOptional()
  @IsString()
  item?: string;

  @ApiPropertyOptional({ example: 'ASSET-001' })
  @IsOptional()
  @IsString()
  assetId?: string;

  @ApiPropertyOptional({ example: 'SN-12345' })
  @IsOptional()
  @IsString()
  serialNumber?: string;

  @ApiPropertyOptional({ example: 'ALLOCATED' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: '2026-03-12T10:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  allocatedAt?: string;

  @ApiPropertyOptional({ example: 1200 })
  @IsOptional()
  @IsNumber()
  estimatedCost?: number;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;
}

export class CreateAssetProvisioningDto {
  @ApiProperty({
    description: 'Employee UUID for asset provisioning.',
    example: 'employee-uuid',
  })
  @IsUUID()
  employeeId!: string;

  @ApiPropertyOptional({
    type: () => [AssetProvisioningEquipmentItemDto],
    description: 'Equipment items to provision.',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssetProvisioningEquipmentItemDto)
  equipment?: AssetProvisioningEquipmentItemDto[];

  @ApiPropertyOptional({
    description: 'Platform permissions required for the employee.',
    example: { googleWorkspace: ['mail', 'drive'], slack: ['admin'] },
  })
  @IsOptional()
  @IsObject()
  platformPermissions?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Whether finance approval is required.',
    example: false,
  })
  @IsOptional()
  @Transform(normalizeBooleanValue)
  @IsBoolean()
  financeApprovalRequired?: boolean;
}

export class UpdateAssetProvisioningDto extends PartialType(
  CreateAssetProvisioningDto,
) {
  @ApiPropertyOptional({
    description: 'IT supervisor approval timestamp.',
    example: '2026-03-12T10:00:00.000Z',
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  itSupervisorApprovedAt?: string | null;

  @ApiPropertyOptional({
    description: 'Admin approval timestamp.',
    example: '2026-03-12T12:00:00.000Z',
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  adminApprovedAt?: string | null;

  @ApiPropertyOptional({
    enum: ASSET_PROVISIONING_STATUSES,
    description: 'Provisioning status.',
    example: 'APPROVED',
  })
  @IsOptional()
  @Transform(normalizeEnumValue)
  @IsEnum(ASSET_PROVISIONING_STATUSES)
  status?: AssetProvisioningStatusValue;
}

// ─── Query DTO ───────────────────────────────────────────────────────────────

export class AssetProvisioningListQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by employee UUID.',
    example: 'employee-uuid',
  })
  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @ApiPropertyOptional({
    enum: ASSET_PROVISIONING_STATUSES,
    description: 'Filter by provisioning status.',
  })
  @IsOptional()
  @Transform(normalizeEnumValue)
  @IsEnum(ASSET_PROVISIONING_STATUSES)
  status?: AssetProvisioningStatusValue;

  @ApiPropertyOptional({
    description: 'Filter by finance approval requirement.',
    example: false,
  })
  @IsOptional()
  @Transform(normalizeBooleanValue)
  @IsBoolean()
  financeApprovalRequired?: boolean;

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

export class AssetProvisioningResponseDto {
  @ApiProperty({ example: 'asset-provisioning-uuid' })
  id!: string;

  @ApiProperty({ example: 'employee-uuid' })
  employeeId!: string;

  @ApiPropertyOptional({
    description: 'Provisioned equipment data.',
    nullable: true,
  })
  equipment!: unknown;

  @ApiPropertyOptional({
    description: 'Platform permissions data.',
    nullable: true,
  })
  platformPermissions!: unknown;

  @ApiPropertyOptional({
    example: '2026-03-12T10:00:00.000Z',
    nullable: true,
  })
  itSupervisorApprovedAt!: string | null;

  @ApiPropertyOptional({
    example: '2026-03-12T12:00:00.000Z',
    nullable: true,
  })
  adminApprovedAt!: string | null;

  @ApiProperty({ example: false })
  financeApprovalRequired!: boolean;

  @ApiProperty({
    enum: ASSET_PROVISIONING_STATUSES,
    example: 'PENDING',
  })
  status!: AssetProvisioningStatusValue;

  @ApiProperty({ example: '2026-03-11T14:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-03-11T14:00:00.000Z' })
  updatedAt!: string;
}
