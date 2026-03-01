import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import type { CreatePositionDto as CreatePositionDtoType } from '@repo/types';

export class CreatePositionDto implements CreatePositionDtoType {
  @ApiProperty({ example: 'Senior Backend Engineer' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({
    example: 'Owns backend service design and delivery.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: '1f31a301-dfb8-4071-aab1-ad6bc4891da7',
    description: 'Department id that owns the position.',
  })
  @IsUUID()
  departmentId!: string;

  @ApiPropertyOptional({
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
