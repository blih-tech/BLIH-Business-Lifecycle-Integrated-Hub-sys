import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

// ─── Input DTOs ─────────────────────────────────────────────────────────────

export class CreateContractSignerDto {
  @ApiProperty({ example: 'user-uuid' })
  @IsUUID()
  userId!: string;

  @ApiProperty({ example: 'Witness' })
  @IsString()
  @IsNotEmpty()
  roleInContract!: string;
}

export class CreateContractDto {
  @ApiProperty({ example: 'template-uuid' })
  @IsUUID()
  templateId!: string;

  @ApiPropertyOptional({ example: 'employee-contract-uuid' })
  @IsOptional()
  @IsUUID()
  employeeContractId?: string;

  @ApiPropertyOptional({ type: () => [CreateContractSignerDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateContractSignerDto)
  signers?: CreateContractSignerDto[];
}

export class UpdateContractSignerDto {
  @ApiPropertyOptional({ example: 'Witness' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  roleInContract?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  hasSigned?: boolean;
}

export class UpdateContractDto extends PartialType(CreateContractDto) {
  @ApiPropertyOptional({ example: 'https://s3.bucket/signed.pdf' })
  @IsOptional()
  @IsString()
  signedFileUrl?: string;
}

// ─── Query DTO ──────────────────────────────────────────────────────────────

export class ContractListQueryDto {
  @ApiPropertyOptional({ description: 'Filter by template UUID' })
  @IsOptional()
  @IsUUID()
  templateId?: string;

  @ApiPropertyOptional({ description: 'Filter by employee contract UUID' })
  @IsOptional()
  @IsUUID()
  employeeContractId?: string;

  @ApiPropertyOptional({
    description: 'Filter contracts where this user is a signer',
  })
  @IsOptional()
  @IsUUID()
  signerUserId?: string;

  @ApiPropertyOptional({
    description: 'Filter contracts pending signature by this user',
  })
  @IsOptional()
  @IsUUID()
  pendingSignatureByUserId?: string;

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

// ─── Response DTOs ──────────────────────────────────────────────────────────

export class ContractSignerResponseDto {
  @ApiProperty({ example: 'signer-uuid' })
  id!: string;

  @ApiProperty({ example: 'user-uuid' })
  userId!: string;

  @ApiProperty({ example: 'John Doe' })
  userName!: string;

  @ApiProperty({ example: 'Witness' })
  roleInContract!: string;

  @ApiProperty({ example: false })
  hasSigned!: boolean;

  @ApiPropertyOptional({ example: '2026-01-01T00:00:00.000Z' })
  signedAt?: string;
}

export class ContractResponseDto {
  @ApiProperty({ example: 'contract-uuid' })
  id!: string;

  @ApiProperty({ example: 'template-uuid' })
  templateId!: string;

  @ApiProperty({ example: 'Standard NDA' })
  templateTitle!: string;

  @ApiPropertyOptional({ example: 'employee-contract-uuid' })
  employeeContractId?: string;

  @ApiPropertyOptional({ example: 'https://s3.bucket/signed.pdf' })
  signedFileUrl?: string;

  @ApiProperty({ type: () => [ContractSignerResponseDto] })
  signers!: ContractSignerResponseDto[];

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updatedAt!: string;
}
