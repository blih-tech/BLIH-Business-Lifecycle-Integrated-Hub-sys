import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import type { UpdateActionDto as UpdateActionDtoType } from '@repo/types';

export class UpdateActionDto implements UpdateActionDtoType {
  @ApiPropertyOptional({
    description: 'Updated action description.',
    example: 'Approval operation for records',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
