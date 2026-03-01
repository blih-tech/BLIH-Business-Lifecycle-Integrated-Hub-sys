import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { PositionResponseDto as PositionResponseDtoType } from '@repo/types';

export class PositionResponseDto implements PositionResponseDtoType {
  @ApiProperty({ example: '8b76752b-df18-45bc-af74-1ea9a0db2e40' })
  id!: string;

  @ApiProperty({ example: 'Senior Backend Engineer' })
  title!: string;

  @ApiPropertyOptional({
    example: 'Owns backend service design and delivery.',
    nullable: true,
  })
  description?: string | null;

  @ApiProperty({
    example: '1f31a301-dfb8-4071-aab1-ad6bc4891da7',
  })
  departmentId!: string;

  @ApiProperty({
    example: 'Engineering',
  })
  departmentName!: string;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: '2026-03-01T10:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-03-01T10:00:00.000Z' })
  updatedAt!: string;
}
