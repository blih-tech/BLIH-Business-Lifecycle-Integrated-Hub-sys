import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayUnique, IsUUID } from 'class-validator';
import type { AssignRolePermissionsDto as AssignRolePermissionsDtoType } from '@repo/types';

export class AssignRolePermissionsDto implements AssignRolePermissionsDtoType {
  @ApiProperty({
    description: 'Permission ids to assign/remove/replace on the role.',
    type: [String],
    example: ['298bad72-4cce-491a-bb04-58dc9ac36b61'],
  })
  @IsArray()
  @ArrayUnique()
  @IsUUID(undefined, { each: true })
  permissionIds!: string[];
}
