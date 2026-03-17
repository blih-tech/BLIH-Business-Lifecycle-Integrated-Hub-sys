import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { DepartmentResponseDto as DepartmentResponseDtoType } from '@repo/types';

export class DepartmentResponseDto implements DepartmentResponseDtoType {
  @ApiProperty({ example: '1f31a301-dfb8-4071-aab1-ad6bc4891da7' })
  id!: string;

  @ApiProperty({ example: 'Engineering' })
  name!: string;

  @ApiPropertyOptional({
    example: '7f31a301-dfb8-4071-aab1-ad6bc4891a99',
    nullable: true,
  })
  parentId!: string | null;
}
