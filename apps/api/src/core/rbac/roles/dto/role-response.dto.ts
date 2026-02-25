import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { RoleResponseDto as RoleResponseDtoType } from '@repo/types';

export class RoleResponseDto implements RoleResponseDtoType {
  @ApiProperty({ example: '57e883d0-d0c0-4187-a232-50fa729f6876' })
  id!: string;

  @ApiProperty({ example: 'finance.approver' })
  name!: string;

  @ApiProperty({ example: 'Finance Approver' })
  displayName!: string;

  @ApiPropertyOptional({
    nullable: true,
    example: 'Approves finance documents.',
  })
  description?: string | null;

  @ApiProperty({
    enum: ['global', 'organization', 'department', 'self'],
    example: 'organization',
  })
  dataScope!: 'global' | 'organization' | 'department' | 'self';

  @ApiProperty({ example: false })
  isSystem!: boolean;

  @ApiPropertyOptional({ nullable: true, example: 'finance' })
  parentRoleName?: string | null;

  @ApiProperty({ type: [String], example: ['invoice:view', 'invoice:approve'] })
  permissions!: string[];

  @ApiProperty({
    description: 'Number of active role assignments.',
    example: 12,
  })
  assignmentCount!: number;

  @ApiProperty({ example: '2026-02-21T18:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-02-21T18:00:00.000Z' })
  updatedAt!: Date;
}
