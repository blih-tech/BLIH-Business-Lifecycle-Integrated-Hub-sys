import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ModuleConfigDto {
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
