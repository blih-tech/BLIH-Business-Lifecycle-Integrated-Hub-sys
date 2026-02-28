import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { CreateRoleDto as CreateRoleDtoType } from '@repo/types';

export class CreateRoleDto implements CreateRoleDtoType {
  @ApiProperty({
    description: 'Machine-readable role name.',
    example: 'finance.approver',
  })
  @IsString()
  name!: string;

  @ApiProperty({
    description: 'Human-readable role label.',
    example: 'Finance Approver',
  })
  @IsString()
  displayName!: string;

  @ApiPropertyOptional({
    description: 'Role description used in governance UI.',
    example: 'Can approve finance documents inside scoped organization.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Optional parent role id for hierarchical role inheritance.',
    example: '8b76752b-df18-45bc-af74-1ea9a0db2e40',
  })
  @IsOptional()
  @IsUUID()
  parentRoleId?: string;
}
