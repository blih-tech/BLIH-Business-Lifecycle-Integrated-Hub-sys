import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import type { UpdateDepartmentDto as UpdateDepartmentDtoType } from '@repo/types';

export class UpdateDepartmentDto implements UpdateDepartmentDtoType {
  @ApiPropertyOptional({
    description: 'Updated department name. Must be unique.',
    example: 'Finance Operations',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Updated department description.',
    example: 'Updated description for finance team responsibilities.',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
