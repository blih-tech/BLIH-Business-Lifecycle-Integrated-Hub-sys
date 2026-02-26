import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import type { CreatePermissionDto as CreatePermissionDtoType } from '@repo/types';

export class CreatePermissionDto implements CreatePermissionDtoType {
  @ApiProperty({
    description: 'Resource id.',
    example: '1f24cdb6-f4e4-4d2a-b991-a82af2019d64',
  })
  @IsUUID()
  resourceId!: string;

  @ApiProperty({
    description: 'Action id.',
    example: '65a7eb9a-8803-4f20-b649-0886c4dceef8',
  })
  @IsUUID()
  actionId!: string;

  @ApiPropertyOptional({
    description: 'Optional permission description.',
    example: 'Approve invoice records.',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
