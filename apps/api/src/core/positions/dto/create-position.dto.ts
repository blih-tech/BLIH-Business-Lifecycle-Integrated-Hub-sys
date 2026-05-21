import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import type { CreatePositionDto as CreatePositionDtoType } from '@repo/types';

export class CreatePositionDto implements CreatePositionDtoType {
  @ApiProperty({ example: 'Senior Backend Engineer' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({
    example: 'Owns backend service design and delivery.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: '1f31a301-dfb8-4071-aab1-ad6bc4891da7',
    description: 'Department id that owns the position.',
  })
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @ApiPropertyOptional({
    example: 'Engineering',
    description: 'Department name to associate or create.',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  departmentName?: string;

  @ApiPropertyOptional({
    example: 'd9fdb6de-2c7b-47e6-9c58-080829f5bd10',
    description: 'Optional job grade id assigned to the position.',
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  gradeId?: string | null;

  @ApiPropertyOptional({
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
