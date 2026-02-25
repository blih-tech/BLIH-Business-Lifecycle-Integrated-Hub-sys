import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsIn, IsOptional, IsString, Matches } from 'class-validator';
import type { UpdateRoleDto as UpdateRoleDtoType } from '@repo/types';

const PERMISSION_KEY_PATTERN = '^[a-z0-9_]+:[a-z0-9_*-]+$';

export class UpdateRoleDto implements UpdateRoleDtoType {
  @ApiPropertyOptional({
    description: 'Updated human-readable role label.',
    example: 'Finance Approver',
  })
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiPropertyOptional({
    description: 'Updated role description.',
    example: 'Approves finance documents.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description:
      'Updated set of permission slugs. Empty array clears bindings.',
    type: [String],
    example: ['invoice:approve', 'expense:view'],
  })
  @IsOptional()
  @IsArray()
  @Matches(new RegExp(PERMISSION_KEY_PATTERN), {
    each: true,
    message: 'Each permission key must be resource:action (2-part only)',
  })
  permissions?: string[];

  @ApiPropertyOptional({
    description:
      'Optional parent role name. Set empty string to remove parent relationship.',
    example: 'finance',
  })
  @IsOptional()
  @IsString()
  parentRoleName?: string;

  @ApiPropertyOptional({
    description: 'Updated role data scope.',
    enum: ['global', 'organization', 'department', 'self'],
    example: 'organization',
  })
  @IsOptional()
  @IsString()
  @IsIn(['global', 'organization', 'department', 'self'])
  dataScope?: 'global' | 'organization' | 'department' | 'self';
}
