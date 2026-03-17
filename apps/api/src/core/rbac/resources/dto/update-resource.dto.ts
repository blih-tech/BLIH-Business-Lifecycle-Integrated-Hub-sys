import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import type { UpdateResourceDto as UpdateResourceDtoType } from '@repo/types';

export class UpdateResourceDto implements UpdateResourceDtoType {
  @ApiPropertyOptional({
    example: 'Updated resource description.',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  description?: string | null;
}
