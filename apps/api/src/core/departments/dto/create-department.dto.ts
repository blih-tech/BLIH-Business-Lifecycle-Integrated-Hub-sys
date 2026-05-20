import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator';
import type { CreateDepartmentDto as CreateDepartmentDtoType } from '@repo/types';

export class CreateDepartmentDto implements CreateDepartmentDtoType {
  @ApiProperty({ example: 'Engineering' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({
    example: 'Software engineering and platform teams.',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional({
    example: '7f31a301-dfb8-4071-aab1-ad6bc4891a99',
    description: 'Optional parent department id for hierarchy.',
    nullable: true,
  })
  @ValidateIf((_, value) => value != null && value !== '')
  @IsUUID()
  parentId?: string | null;
}
