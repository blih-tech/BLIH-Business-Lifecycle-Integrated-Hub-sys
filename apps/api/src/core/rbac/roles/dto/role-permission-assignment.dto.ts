import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';
import type { RolePermissionAssignmentDto as RolePermissionAssignmentDtoType } from '@repo/types';

export class RolePermissionAssignmentDto implements RolePermissionAssignmentDtoType {
  @ApiProperty({
    type: [String],
    example: ['8b76752b-df18-45bc-af74-1ea9a0db2e40'],
    description: 'Permission ids to add/remove/replace for the role.',
  })
  @IsArray()
  @IsUUID(undefined, { each: true })
  permissionIds!: string[];
}
