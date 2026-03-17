import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type {
  LeaveApprovalResponseDto as LeaveApprovalResponseDtoType,
  LeaveBalanceDto as LeaveBalanceDtoType,
  LeaveRequestResponseDto as LeaveRequestResponseDtoType,
} from '@repo/types';

export class LeaveApprovalResponseDto implements LeaveApprovalResponseDtoType {
  @ApiProperty({ example: '8cffc41a-9c2f-4a32-a952-a3b9b33bf043' })
  id!: string;

  @ApiProperty({ example: '40b5c2fb-7a2f-4af2-ac03-fad1bb3fe061' })
  approverId!: string;

  @ApiProperty({ example: 1 })
  level!: number;

  @ApiProperty({
    example: 'PENDING',
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
  })
  decision!: 'PENDING' | 'APPROVED' | 'REJECTED';

  @ApiPropertyOptional({ nullable: true, example: 'Approved by line manager' })
  comments!: string | null;

  @ApiPropertyOptional({ nullable: true, example: '2026-02-20T08:30:00.000Z' })
  decidedAt!: string | null;

  @ApiProperty({ example: '2026-02-18T09:00:00.000Z' })
  createdAt!: string;
}

export class LeaveRequestResponseDto implements LeaveRequestResponseDtoType {
  @ApiProperty({ example: '86a265fe-6e0c-44e5-bf21-642fb58e116a' })
  id!: string;

  @ApiProperty({ example: 'LR-2026-0001' })
  requestId!: string;

  @ApiProperty({ example: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374' })
  employeeId!: string;

  @ApiProperty({
    example: 'ANNUAL',
    enum: [
      'ANNUAL',
      'SICK',
      'MATERNITY',
      'PATERNITY',
      'BEREAVEMENT',
      'UNPAID',
      'STUDY',
      'EMERGENCY',
      'COMPASSIONATE',
    ],
  })
  leaveType!: LeaveRequestResponseDtoType['leaveType'];

  @ApiProperty({ example: '2026-03-10' })
  startDate!: string;

  @ApiProperty({ example: '2026-03-14' })
  endDate!: string;

  @ApiProperty({ example: 5 })
  daysRequested!: number;

  @ApiProperty({ example: false })
  startHalfDay!: boolean;

  @ApiProperty({ example: false })
  endHalfDay!: boolean;

  @ApiPropertyOptional({ nullable: true, example: 'Family vacation' })
  reason!: string | null;

  @ApiPropertyOptional({
    nullable: true,
    example: 'Vacation request aligned with delivery handover schedule.',
  })
  description!: string | null;

  @ApiPropertyOptional({
    nullable: true,
    type: () => Object,
    example: { phone: '+251911000000', location: 'Addis Ababa' },
  })
  contactDuringLeave!: unknown;

  @ApiPropertyOptional({
    nullable: true,
    example: '9d7ea523-bf4e-47ef-a6d1-e16ac1509f36',
  })
  handoverDelegateId!: string | null;

  @ApiPropertyOptional({
    nullable: true,
    example: 'Escalations to be handled by the squad lead.',
  })
  handoverNotes!: string | null;

  @ApiPropertyOptional({
    nullable: true,
    type: () => Object,
    example: { annual: { available: 15, pending: 5 } },
  })
  balanceSnapshot!: unknown;

  @ApiPropertyOptional({ nullable: true, example: '2026-02-18T09:05:00.000Z' })
  submittedAt!: string | null;

  @ApiProperty({ type: () => [LeaveApprovalResponseDto] })
  approvalSteps!: LeaveApprovalResponseDto[];

  @ApiProperty({
    example: 'PENDING',
    enum: ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'],
  })
  status!: LeaveRequestResponseDtoType['status'];

  @ApiPropertyOptional({
    nullable: true,
    example: '40b5c2fb-7a2f-4af2-ac03-fad1bb3fe061',
  })
  approvedById!: string | null;

  @ApiPropertyOptional({ nullable: true, example: '2026-02-20T08:30:00.000Z' })
  approvedAt!: string | null;

  @ApiPropertyOptional({ nullable: true, example: null })
  rejectionReason!: string | null;

  @ApiProperty({ example: '2026-02-18T09:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-02-18T09:05:00.000Z' })
  updatedAt!: string;
}

export class LeaveBalanceDto implements LeaveBalanceDtoType {
  @ApiProperty({
    example: 'ANNUAL',
    enum: [
      'ANNUAL',
      'SICK',
      'MATERNITY',
      'PATERNITY',
      'BEREAVEMENT',
      'UNPAID',
      'STUDY',
      'EMERGENCY',
      'COMPASSIONATE',
    ],
  })
  leaveType!: LeaveBalanceDtoType['leaveType'];

  @ApiProperty({ example: 2026 })
  year!: number;

  @ApiProperty({ example: 20 })
  totalDays!: number;

  @ApiProperty({ example: 0 })
  carriedOver!: number;

  @ApiProperty({ example: 5 })
  used!: number;

  @ApiProperty({ example: 2 })
  pending!: number;

  @ApiProperty({ example: 13 })
  available!: number;
}
