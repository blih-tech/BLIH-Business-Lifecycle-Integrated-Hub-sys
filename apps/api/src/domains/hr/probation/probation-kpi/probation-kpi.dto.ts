import { PartialType } from '@nestjs/swagger';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

// ─── Input DTOs ──────────────────────────────────────────────────────────────

export class CreateKpiDto {
  @ApiProperty({
    example: 'Q1 Sales Target',
    description: 'Name of the KPI.',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({
    nullable: true,
    example: 'Achieve $100k in sales by end of Q1.',
    description: 'Optional detailed description of the KPI.',
  })
  @IsOptional()
  @IsString()
  description?: string | null;
}

export class UpdateKpiDto extends PartialType(CreateKpiDto) {}

// ─── Query DTO ───────────────────────────────────────────────────────────────

export class KpiListQueryDto {
  @ApiPropertyOptional({
    description: 'Case-insensitive keyword search on name and description.',
    example: 'sales',
  })
  @IsOptional()
  @IsString()
  search?: string;

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

export class KpiResponseDto {
  @ApiProperty({ example: 'c9a7b3e1-12d4-4f18-b5a6-3f9d2c8e7b01' })
  id!: string;

  @ApiProperty({ example: 'Q1 Sales Target' })
  name!: string;

  @ApiPropertyOptional({
    nullable: true,
    example: 'Achieve $100k in sales by end of Q1.',
  })
  description!: string | null;

  @ApiProperty({ example: '2026-03-21T14:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-03-21T14:00:00.000Z' })
  updatedAt!: string;
}
