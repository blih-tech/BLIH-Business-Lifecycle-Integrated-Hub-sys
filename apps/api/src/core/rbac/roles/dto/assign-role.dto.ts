import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { AssignRoleDto as AssignRoleDtoType } from '@repo/types';

export class AssignRoleDto implements AssignRoleDtoType {
  @ApiProperty({
    description: 'Target user id or Keycloak id.',
    example: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374',
  })
  @IsString()
  userId!: string;

  @ApiProperty({
    description: 'Role name to assign or revoke.',
    example: 'finance.approver',
  })
  @IsString()
  roleName!: string;

  @ApiPropertyOptional({
    description: 'Actor who performed this assignment.',
    format: 'uuid',
    example: '40b5c2fb-7a2f-4af2-ac03-fad1bb3fe061',
  })
  @IsOptional()
  @IsUUID()
  assignedBy?: string;

  @ApiPropertyOptional({
    description:
      'Optional expiration timestamp for temporary role assignments.',
    format: 'date-time',
    example: '2026-12-31T23:59:59.000Z',
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
