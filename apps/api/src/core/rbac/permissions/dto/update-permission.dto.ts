import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import type { UpdatePermissionDto as UpdatePermissionDtoType } from '@repo/types';

export class UpdatePermissionDto implements UpdatePermissionDtoType {
  @ApiPropertyOptional({
    description: 'Updated permission description.',
    example: 'Approve invoice records in finance.',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
