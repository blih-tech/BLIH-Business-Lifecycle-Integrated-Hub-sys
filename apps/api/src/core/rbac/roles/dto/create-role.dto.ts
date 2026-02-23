import { IsArray, IsIn, IsOptional, IsString, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const PERMISSION_KEY_PATTERN = '^[a-z0-9_]+:[a-z0-9_*-]+$';

export class CreateRoleDto {
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
    description:
      'Optional single permission key to bind to this role (legacy input).',
    pattern: PERMISSION_KEY_PATTERN,
    example: 'invoice:approve',
  })
  @IsOptional()
  @Matches(new RegExp(PERMISSION_KEY_PATTERN), {
    message:
      'Permission key must be resource:action (2-part only, e.g. invoice:approve)',
  })
  permission?: string;

  @ApiPropertyOptional({
    description: 'Optional multiple permission keys to bind to this role.',
    type: [String],
    pattern: PERMISSION_KEY_PATTERN,
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
    description: 'Optional parent role name for hierarchical role inheritance.',
    example: 'finance',
  })
  @IsOptional()
  @IsString()
  parentRoleName?: string;

  @ApiPropertyOptional({
    description: 'Role data scope strategy.',
    enum: ['global', 'self'],
    example: 'global',
  })
  @IsOptional()
  @IsString()
  @IsIn(['global', 'self'])
  dataScope?: 'global' | 'self';
}
