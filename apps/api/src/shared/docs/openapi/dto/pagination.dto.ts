import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class PaginationQueryDto {
  @ApiPropertyOptional({
    description: '1-based page index.',
    minimum: 1,
    default: 1,
    example: 1,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of records per page.',
    minimum: 1,
    maximum: 100,
    default: 20,
    example: 20,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Field name used for sorting.',
    example: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Sort direction.',
    enum: ['asc', 'desc'],
    default: 'desc',
    example: 'desc',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class PaginationMetaDto {
  @ApiProperty({ example: 1, description: 'Current page index (1-based).' })
  page!: number;

  @ApiProperty({ example: 20, description: 'Configured page size.' })
  limit!: number;

  @ApiProperty({
    example: 245,
    description: 'Total number of available records.',
  })
  totalItems!: number;

  @ApiProperty({ example: 13, description: 'Total number of pages.' })
  totalPages!: number;

  @ApiProperty({
    example: true,
    description: 'True when the next page exists.',
  })
  hasNextPage!: boolean;

  @ApiProperty({
    example: false,
    description: 'True when the previous page exists.',
  })
  hasPreviousPage!: boolean;
}
