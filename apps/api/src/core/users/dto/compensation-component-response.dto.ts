import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CompensationComponentType } from '../../../platform/prisma/prisma-client';
import type { CompensationComponentResponseDto as CompensationComponentResponseDtoType } from '@repo/types';

export class CompensationComponentResponseDto implements CompensationComponentResponseDtoType {
  @ApiProperty({ example: '43e84c7f-7de3-405f-a519-8010f5b65e49' })
  id!: string;

  @ApiProperty({ example: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374' })
  userId!: string;

  @ApiProperty({ example: 'Transport Allowance' })
  name!: string;

  @ApiProperty({
    enum: CompensationComponentType,
    example: CompensationComponentType.ALLOWANCE,
  })
  type!: CompensationComponentType;

  @ApiProperty({ example: '1200.00' })
  amount!: string;

  @ApiProperty({ example: true })
  isRecurring!: boolean;

  @ApiProperty({ example: '2026-01-01' })
  effectiveFrom!: string;

  @ApiPropertyOptional({ nullable: true, example: null })
  effectiveTo!: string | null;

  @ApiProperty({ example: '2026-01-01T08:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-01-01T08:00:00.000Z' })
  updatedAt!: string;
}
