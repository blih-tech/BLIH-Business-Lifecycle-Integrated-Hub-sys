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
  departmentId?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
