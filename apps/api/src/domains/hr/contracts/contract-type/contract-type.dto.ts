import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

// ─── Input DTOs ─────────────────────────────────────────────────────────────

export class CreateContractTypeDto {
  @ApiProperty({
    description: 'Name of the contract type',
    example: 'Employment Contract',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'Description of the contract type',
    example: 'Standard full-time employment agreement',
  })
  @IsString()
  @IsNotEmpty()
  description!: string;
}

export class UpdateContractTypeDto extends PartialType(CreateContractTypeDto) {}

// ─── Query DTO ──────────────────────────────────────────────────────────────

export class ContractTypeListQueryDto {
  @ApiPropertyOptional({
    description: 'Search string to filter by name or description',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    default: 1,
    minimum: 1,
    description: 'Page index (1-based)',
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
    description: 'Items per page',
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value as string, 10))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

// ─── Response DTOs ──────────────────────────────────────────────────────────

export class ContractTypeResponseDto {
  @ApiProperty({ example: 'uuid-string' })
  id!: string;

  @ApiProperty({ example: 'Employment Contract' })
  name!: string;

  @ApiProperty({ example: 'Standard agreement' })
  description!: string;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updatedAt!: string;
}
