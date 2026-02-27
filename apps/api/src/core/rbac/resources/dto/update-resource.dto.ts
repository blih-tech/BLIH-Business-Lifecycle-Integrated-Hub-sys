import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import type { UpdateResourceDto as UpdateResourceDtoType } from '@repo/types';

export class UpdateResourceDto implements UpdateResourceDtoType {
  @ApiPropertyOptional({
    description: 'Updated resource description.',
    example: 'Invoice management and approvals',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
