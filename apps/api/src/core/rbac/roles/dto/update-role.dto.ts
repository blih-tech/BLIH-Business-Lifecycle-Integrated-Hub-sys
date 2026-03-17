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
      'Optional parent role id. Set null to remove the parent relationship.',
    example: '8b76752b-df18-45bc-af74-1ea9a0db2e40',
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  parentRoleId?: string | null;
}
