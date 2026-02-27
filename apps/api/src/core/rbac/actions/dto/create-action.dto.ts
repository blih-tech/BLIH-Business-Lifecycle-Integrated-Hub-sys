import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import type { CreateActionDto as CreateActionDtoType } from '@repo/types';

export class CreateActionDto implements CreateActionDtoType {
  @ApiProperty({ example: 'approve' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: 'Approve operation on a resource.' })
  @IsOptional()
  @IsString()
  description?: string;
}
