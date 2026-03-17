import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import type { UpdatePermissionDto as UpdatePermissionDtoType } from '@repo/types';

export class UpdatePermissionDto implements UpdatePermissionDtoType {
  @ApiPropertyOptional({
    example: 'Updated permission description.',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  description?: string | null;
}
