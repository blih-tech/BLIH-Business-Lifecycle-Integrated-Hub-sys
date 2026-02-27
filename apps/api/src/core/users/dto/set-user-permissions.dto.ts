import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';
import type { SetUserPermissionsDto as SetUserPermissionsDtoType } from '@repo/types';

export class SetUserPermissionsDto implements SetUserPermissionsDtoType {
  @ApiProperty({
    description:
      'Selected user permissions. Must be assignable from currently assigned roles.',
    type: [String],
    example: ['invoice:view', 'invoice:approve'],
  })
  @IsArray()
  @IsString({ each: true })
  permissions!: string[];
}
