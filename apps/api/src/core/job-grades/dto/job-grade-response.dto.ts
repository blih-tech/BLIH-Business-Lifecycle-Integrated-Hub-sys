import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { JobGradeResponseDto as JobGradeResponseDtoType } from '@repo/types';

export class JobGradeResponseDto implements JobGradeResponseDtoType {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  code!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  level!: number;

  @ApiPropertyOptional({ nullable: true })
  minSalary!: number | null;

  @ApiPropertyOptional({ nullable: true })
  maxSalary!: number | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}
