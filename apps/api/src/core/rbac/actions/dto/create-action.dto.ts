import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';
import type { CreateActionDto as CreateActionDtoType } from '@repo/types';

const ACTION_NAME_PATTERN = '^[a-z0-9_*-]+$';

export class CreateActionDto implements CreateActionDtoType {
  @ApiProperty({
    description: 'Immutable action name.',
    example: 'approve',
    pattern: ACTION_NAME_PATTERN,
  })
  @IsString()
  @Matches(new RegExp(ACTION_NAME_PATTERN), {
    message: 'Action name must contain lowercase letters, numbers, _, * or -',
  })
  name!: string;

  @ApiPropertyOptional({
    description: 'Optional action description.',
    example: 'Approval operation',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
