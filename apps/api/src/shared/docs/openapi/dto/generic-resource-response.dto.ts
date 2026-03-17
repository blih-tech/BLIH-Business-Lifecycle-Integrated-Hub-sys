import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenericEntityResponseDto {
  @ApiProperty({ example: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374' })
  id!: string;

  @ApiPropertyOptional({ nullable: true, example: 'REQ-2026-0001' })
  requestId?: string | null;

  @ApiPropertyOptional({
    nullable: true,
    example: 'd53219ba-7856-4c17-94bc-c40d6a7d0895',
  })
  employeeId?: string | null;

  @ApiPropertyOptional({
    nullable: true,
    example: 'Quarterly performance review',
  })
  title?: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'Policy Acknowledgement' })
  name?: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'ACTIVE' })
  status?: string | null;

  @ApiPropertyOptional({ nullable: true, example: '2026-03-10T08:00:00.000Z' })
  submittedAt?: string | null;

  @ApiPropertyOptional({
    nullable: true,
    example: '4d938f13-a8fc-45b9-a81f-a9100fa4e2f2',
  })
  approvedById?: string | null;

  @ApiPropertyOptional({ nullable: true, example: '2026-03-12T08:00:00.000Z' })
  approvedAt?: string | null;

  @ApiPropertyOptional({ nullable: true, example: null })
  rejectionReason?: string | null;

  @ApiPropertyOptional({
    nullable: true,
    type: () => Object,
    example: { summary: 'Representative response metadata' },
  })
  details?: Record<string, unknown> | null;

  @ApiProperty({ example: '2026-03-10T08:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-03-12T08:00:00.000Z' })
  updatedAt!: string;
}

export class GenericMetricsResponseDto {
  @ApiProperty({ example: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374' })
  id!: string;

  @ApiPropertyOptional({ nullable: true, example: 'ACTIVE' })
  status?: string | null;

  @ApiPropertyOptional({ example: 78.5 })
  overallProgress?: number | null;

  @ApiPropertyOptional({ example: 12 })
  total?: number | null;

  @ApiPropertyOptional({
    type: () => [GenericEntityResponseDto],
  })
  items?: GenericEntityResponseDto[];

  @ApiPropertyOptional({
    nullable: true,
    type: () => Object,
    example: { score: 4.3, trend: 'UP' },
  })
  details?: Record<string, unknown> | null;

  @ApiProperty({ example: '2026-03-10T08:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-03-12T08:00:00.000Z' })
  updatedAt!: string;
}
