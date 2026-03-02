import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CompensationComponentType } from '../../../platform/prisma/prisma-client';
import type { CompensationComponentResponseDto as CompensationComponentResponseDtoType } from '@repo/types';

export class CompensationComponentResponseDto implements CompensationComponentResponseDtoType {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ enum: CompensationComponentType })
  type!: CompensationComponentType;

  @ApiProperty({ example: '1200.00' })
  amount!: string;

  @ApiProperty()
  isRecurring!: boolean;

  @ApiProperty()
  effectiveFrom!: string;

  @ApiPropertyOptional({ nullable: true })
  effectiveTo!: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}
