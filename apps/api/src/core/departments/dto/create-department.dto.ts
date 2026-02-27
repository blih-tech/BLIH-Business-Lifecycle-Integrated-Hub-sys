import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import type { CreateDepartmentDto as CreateDepartmentDtoType } from '@repo/types';

export class CreateDepartmentDto implements CreateDepartmentDtoType {
  @ApiProperty({
    description: 'Department name. Must be unique.',
    example: 'Finance',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({
    description: 'Optional department description.',
    example: 'Handles accounting, budgeting, and financial operations.',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
