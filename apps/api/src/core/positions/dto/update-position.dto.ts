import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import type { UpdatePositionDto as UpdatePositionDtoType } from '@repo/types';

export class UpdatePositionDto implements UpdatePositionDtoType {
  @ApiPropertyOptional({ example: 'Principal Backend Engineer' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @ApiPropertyOptional({
    example: 'Leads backend architecture decisions.',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional({
    example: '1f31a301-dfb8-4071-aab1-ad6bc4891da7',
    description: 'Department id that owns the position.',
  })
  @IsOptional()
  @IsUUID()
  departmentId?: string | null;

  @ApiPropertyOptional({
    example: 'd9fdb6de-2c7b-47e6-9c58-080829f5bd10',
    description: 'Job grade id assigned to the position. Use null to clear it.',
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  gradeId?: string | null;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
