import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import type { CreatePermissionDto as CreatePermissionDtoType } from '@repo/types';

export class CreatePermissionDto implements CreatePermissionDtoType {
  @ApiProperty({ example: '8b76752b-df18-45bc-af74-1ea9a0db2e40' })
  @IsUUID()
  resourceId!: string;

  @ApiProperty({ example: '65a7eb9a-8803-4f20-b649-0886c4dceef8' })
  @IsUUID()
  actionId!: string;

  @ApiPropertyOptional({ example: 'Approve invoice records.' })
  @IsOptional()
  @IsString()
  description?: string;
}
