import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ActionResponseDto {
  @ApiProperty({ example: '8b76752b-df18-45bc-af74-1ea9a0db2e40' })
  id!: string;

  @ApiProperty({ example: 'approve' })
  name!: string;

  @ApiPropertyOptional({
    example: 'Approval operation on a resource.',
    nullable: true,
  })
  description?: string | null;

  @ApiProperty({ example: '2026-02-20T16:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-02-20T16:00:00.000Z' })
  updatedAt!: Date;
}
