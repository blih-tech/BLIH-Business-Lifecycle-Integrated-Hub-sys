import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';
import type { CreateResourceDto as CreateResourceDtoType } from '@repo/types';

const RESOURCE_NAME_PATTERN = '^[a-z0-9_]+$';

export class CreateResourceDto implements CreateResourceDtoType {
  @ApiProperty({
    description: 'Immutable resource name.',
    example: 'invoice',
    pattern: RESOURCE_NAME_PATTERN,
  })
  @IsString()
  @Matches(new RegExp(RESOURCE_NAME_PATTERN), {
    message: 'Resource name must contain lowercase letters, numbers, or _',
  })
  name!: string;

  @ApiPropertyOptional({
    description: 'Optional resource description.',
    example: 'Invoice management',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
