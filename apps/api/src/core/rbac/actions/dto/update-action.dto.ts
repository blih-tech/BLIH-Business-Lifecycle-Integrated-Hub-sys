import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import type { UpdateActionDto as UpdateActionDtoType } from '@repo/types';

export class UpdateActionDto implements UpdateActionDtoType {
  @ApiPropertyOptional({
    example: 'Updated action description.',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  description?: string | null;
}
