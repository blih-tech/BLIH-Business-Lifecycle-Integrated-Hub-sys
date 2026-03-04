import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import type { CreateResourceDto as CreateResourceDtoType } from '@repo/types';

export class CreateResourceDto implements CreateResourceDtoType {
  @ApiProperty({ example: 'invoice' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: 'Invoice management resource.' })
  @IsOptional()
  @IsString()
  description?: string;
}
