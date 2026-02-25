import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { ModuleConfigDto as ModuleConfigDtoType } from '@repo/types';

export class ModuleConfigDto implements ModuleConfigDtoType {
  @ApiProperty({
    description: 'Module identifier.',
    example: 'finance',
  })
  @IsString()
  module!: string;

  @ApiProperty({
    description: 'Enable/disable module access.',
    example: true,
  })
  @IsBoolean()
  enabled!: boolean;

  @ApiPropertyOptional({
    description: 'Module license key, if applicable.',
    example: 'LIC-2026-XXXX-XXXX',
  })
  @IsOptional()
  @IsString()
  licenseKey?: string;
}
