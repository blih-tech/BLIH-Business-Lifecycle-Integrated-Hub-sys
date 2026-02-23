import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PermissionResponseDto {
  @ApiProperty({ example: '8b76752b-df18-45bc-af74-1ea9a0db2e40' })
  id!: string;

  @ApiProperty({ example: 'invoice:approve' })
  slug!: string;

  @ApiProperty({ example: 'c2aeb3b0-dfce-4752-8092-4e7542e6ba4b' })
  moduleId!: string;

  @ApiProperty({ example: 'finance' })
  module!: string;

  @ApiProperty({ example: '1f24cdb6-f4e4-4d2a-b991-a82af2019d64' })
  resourceId!: string;

  @ApiProperty({ example: 'invoice' })
  resource!: string;

  @ApiProperty({ example: '65a7eb9a-8803-4f20-b649-0886c4dceef8' })
  actionId!: string;

  @ApiProperty({ example: 'approve' })
  action!: string;

  @ApiPropertyOptional({
    example: 'Approve invoice records.',
    nullable: true,
  })
  description?: string | null;

  @ApiProperty({ example: '2026-02-20T16:00:00.000Z' })
  createdAt!: Date;
}
