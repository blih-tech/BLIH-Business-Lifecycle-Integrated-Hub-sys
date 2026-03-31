import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

// ─── Input DTOs ─────────────────────────────────────────────────────────────

export class CreateContractTemplateDto {
  @ApiProperty({ example: 'Standard NDA' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'Non-disclosure agreement for all employees' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ example: 'type-uuid' })
  @IsUUID()
  contractTypeId!: string;

  @ApiProperty({ example: 'https://s3.bucket/nda-template.pdf' })
  @IsString()
  @IsNotEmpty()
  fileUrl!: string;
}

export class UpdateContractTemplateDto extends PartialType(
  CreateContractTemplateDto,
) {}

// ─── Query DTO ──────────────────────────────────────────────────────────────

export class ContractTemplateListQueryDto {
  @ApiPropertyOptional({ description: 'Filter by contract type UUID' })
  @IsOptional()
  @IsUUID()
  contractTypeId?: string;

  @ApiPropertyOptional({ description: 'Search title or description' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value as string, 10))
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value as string, 10))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

// ─── Response DTO ───────────────────────────────────────────────────────────

export class ContractTypeShortDto {
  @ApiProperty({ example: 'type-uuid' })
  id!: string;

  @ApiProperty({ example: 'NDA' })
  name!: string;
}

export class ContractTemplateResponseDto {
  @ApiProperty({ example: 'template-uuid' })
  id!: string;

  @ApiProperty({ example: 'Standard NDA' })
  title!: string;

  @ApiProperty({ example: 'Non-disclosure agreement wrapper' })
  description!: string;

  @ApiProperty({ example: 'type-uuid' })
  contractTypeId!: string;

  @ApiProperty({ type: () => ContractTypeShortDto })
  type!: ContractTypeShortDto;

  @ApiProperty({ example: 'https://s3.bucket/nda-template.pdf' })
  fileUrl!: string;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updatedAt!: string;
}
