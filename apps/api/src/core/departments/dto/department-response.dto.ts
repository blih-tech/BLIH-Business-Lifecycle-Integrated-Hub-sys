import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { DepartmentResponseDto as DepartmentResponseDtoType } from '@repo/types';

export class DepartmentResponseDto implements DepartmentResponseDtoType {
  @ApiProperty({
    description: 'Department id.',
    example: '1f31a301-dfb8-4071-aab1-ad6bc4891da7',
  })
  id!: string;

  @ApiProperty({
    description: 'Department name.',
    example: 'Finance',
  })
  name!: string;

  @ApiPropertyOptional({
    description: 'Department description.',
    example: 'Handles accounting, budgeting, and financial operations.',
    nullable: true,
  })
  description?: string | null;

  @ApiProperty({
    description: 'Creation timestamp.',
    example: '2026-02-27T10:00:00.000Z',
  })
  createdAt!: string;

  @ApiProperty({
    description: 'Last update timestamp.',
    example: '2026-02-27T10:00:00.000Z',
  })
  updatedAt!: string;
}
