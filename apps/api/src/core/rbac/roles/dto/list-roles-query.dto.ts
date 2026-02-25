import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import type { ListRolesQueryDto as ListRolesQueryDtoType } from '@repo/types';

export class ListRolesQueryDto implements ListRolesQueryDtoType {
  @ApiPropertyOptional({
    description: 'Page number (1-based).',
    example: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Page size (max 100).',
    example: 20,
    default: 20,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Case-insensitive search on role name/displayName.',
    example: 'finance',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by role data scope.',
    enum: ['global', 'organization', 'department', 'self'],
    example: 'organization',
  })
  @IsOptional()
  @IsString()
  @IsIn(['global', 'organization', 'department', 'self'])
  dataScope?: 'global' | 'organization' | 'department' | 'self';

  @ApiPropertyOptional({
    description: 'Filter by system role flag.',
    example: false,
  })
  @Type(() => Boolean)
  @IsOptional()
  @IsBoolean()
  isSystem?: boolean;
}
