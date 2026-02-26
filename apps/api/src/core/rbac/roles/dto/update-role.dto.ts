import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import type { UpdateRoleDto as UpdateRoleDtoType } from '@repo/types';

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
      'Optional parent role id. Use null to remove parent relationship.',
    example: '57e883d0-d0c0-4187-a232-50fa729f6876',
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  parentRoleId?: string | null;
}
