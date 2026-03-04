import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type {
  InternalTransferRequestResponseDto as InternalTransferRequestResponseDtoType,
  SalaryAdjustmentRequestResponseDto as SalaryAdjustmentRequestResponseDtoType,
} from '@repo/types';

export class SalaryAdjustmentRequestResponseDto implements SalaryAdjustmentRequestResponseDtoType {
  @ApiProperty({ example: 'f013924f-d875-4ae9-9cbb-4f4913e6762f' })
  id!: string;

  @ApiProperty({ example: 'SAL-2026-0001' })
  requestId!: string;

  @ApiProperty({ example: 'd53219ba-7856-4c17-94bc-c40d6a7d0895' })
  employeeId!: string;

  @ApiProperty({ example: '40b5c2fb-7a2f-4af2-ac03-fad1bb3fe061' })
  proposedById!: string;

  @ApiPropertyOptional({ nullable: true, example: null })
  linkedReviewId!: string | null;

  @ApiPropertyOptional({ nullable: true, example: null })
  linkedTransferRequestId!: string | null;

  @ApiProperty({
    example: 'MERIT',
    enum: ['MERIT', 'EQUITY', 'PROMOTION', 'TRANSFER', 'RETENTION', 'MARKET'],
  })
  reason!: SalaryAdjustmentRequestResponseDtoType['reason'];

  @ApiPropertyOptional({ nullable: true, example: 8500 })
  currentBaseSalary!: number | null;

  @ApiProperty({ example: 9200 })
  proposedBaseSalary!: number;

  @ApiProperty({ example: 8.24 })
  percentChange!: number;

  @ApiPropertyOptional({ nullable: true, example: 'USD' })
  currency!: string | null;

  @ApiProperty({ example: '2026-04-01T00:00:00.000Z' })
  effectiveFrom!: string;

  @ApiPropertyOptional({
    nullable: true,
    type: () => Object,
    example: { rationale: 'Strong performance and expanded scope.' },
  })
  justification!: unknown;

  @ApiProperty({
    example: 'PENDING',
    enum: ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'],
  })
  status!: SalaryAdjustmentRequestResponseDtoType['status'];

  @ApiPropertyOptional({ nullable: true, example: '2026-03-10T08:00:00.000Z' })
  submittedAt!: string | null;

  @ApiPropertyOptional({
    nullable: true,
    example: '4d938f13-a8fc-45b9-a81f-a9100fa4e2f2',
  })
  approvedById!: string | null;

  @ApiPropertyOptional({ nullable: true, example: '2026-03-12T08:00:00.000Z' })
  approvedAt!: string | null;

  @ApiPropertyOptional({ nullable: true, example: null })
  rejectionReason!: string | null;

  @ApiProperty({ example: '2026-03-10T08:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-03-12T08:00:00.000Z' })
  updatedAt!: string;
}

export class InternalTransferRequestResponseDto implements InternalTransferRequestResponseDtoType {
  @ApiProperty({ example: '5192d80d-a442-4db4-aa30-c05696de8b7b' })
  id!: string;

  @ApiProperty({ example: 'ITR-2026-0002' })
  requestId!: string;

  @ApiProperty({ example: 'd53219ba-7856-4c17-94bc-c40d6a7d0895' })
  employeeId!: string;

  @ApiProperty({ example: 'PROMOTION', enum: ['PROMOTION', 'TRANSFER'] })
  requestType!: InternalTransferRequestResponseDtoType['requestType'];

  @ApiPropertyOptional({
    nullable: true,
    example: 'b6f9c3c0-88f3-4b92-9c44-4e9f5d0d4964',
  })
  currentPositionId!: string | null;

  @ApiProperty({ example: 'af429737-1cf8-47d7-bb1f-9724982f34fb' })
  targetPositionId!: string;

  @ApiProperty({ example: '40b5c2fb-7a2f-4af2-ac03-fad1bb3fe061' })
  requestedById!: string;

  @ApiProperty({ example: 'Promotion based on leadership growth' })
  reason!: string;

  @ApiPropertyOptional({
    nullable: true,
    type: () => Object,
    example: { summary: 'Ready for cross-team ownership.' },
  })
  businessCase!: unknown;

  @ApiPropertyOptional({ nullable: true, example: '2026-05-01T00:00:00.000Z' })
  desiredEffectiveDate!: string | null;

  @ApiPropertyOptional({
    nullable: true,
    type: () => Object,
    example: { proposedBaseSalary: 9800, currency: 'USD' },
  })
  compensationChange!: unknown;

  @ApiProperty({
    example: 'PENDING',
    enum: ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'],
  })
  status!: InternalTransferRequestResponseDtoType['status'];

  @ApiPropertyOptional({ nullable: true, example: '2026-03-10T08:00:00.000Z' })
  submittedAt!: string | null;

  @ApiPropertyOptional({
    nullable: true,
    example: '4d938f13-a8fc-45b9-a81f-a9100fa4e2f2',
  })
  approvedById!: string | null;

  @ApiPropertyOptional({ nullable: true, example: '2026-03-12T08:00:00.000Z' })
  approvedAt!: string | null;

  @ApiPropertyOptional({ nullable: true, example: null })
  rejectionReason!: string | null;

  @ApiProperty({ example: '2026-03-10T08:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-03-12T08:00:00.000Z' })
  updatedAt!: string;
}
