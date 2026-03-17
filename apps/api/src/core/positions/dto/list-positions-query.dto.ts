import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsUUID } from 'class-validator';
import type { ListPositionsQueryDto as ListPositionsQueryDtoType } from '@repo/types';

export class ListPositionsQueryDto implements ListPositionsQueryDtoType {
  @ApiPropertyOptional({
    example: '1f31a301-dfb8-4071-aab1-ad6bc4891da7',
    description: 'Filter positions by department id.',
  })
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Filter positions by active state.',
  })
  @Type(() => Boolean)
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
