import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LifecycleStatus } from '../../../platform/prisma/prisma-client';
import type { UserLifecycleResponseDto as UserLifecycleResponseDtoType } from '@repo/types';

export class UserLifecycleResponseDto implements UserLifecycleResponseDtoType {
  @ApiProperty({ example: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374' })
  userId!: string;

  @ApiProperty({ enum: LifecycleStatus, example: LifecycleStatus.ACTIVE })
  status!: LifecycleStatus;

  @ApiPropertyOptional({ nullable: true, example: '2025-12-01T08:00:00.000Z' })
  onboardedAt?: string | null;

  @ApiPropertyOptional({ nullable: true, example: null })
  suspendedAt?: string | null;

  @ApiPropertyOptional({ nullable: true, example: null })
  terminatedAt?: string | null;

  @ApiPropertyOptional({ nullable: true, example: null })
  terminationReason?: string | null;

  @ApiProperty({ example: false })
  offboardingCompleted!: boolean;

  @ApiProperty({ example: '2025-12-01T08:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-02-15T09:12:24.144Z' })
  updatedAt!: string;
}
