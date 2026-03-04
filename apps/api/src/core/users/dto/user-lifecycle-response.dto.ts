import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LifecycleStatus } from '../../../platform/prisma/prisma-client';
import type { UserLifecycleResponseDto as UserLifecycleResponseDtoType } from '@repo/types';

export class UserLifecycleResponseDto implements UserLifecycleResponseDtoType {
  @ApiProperty()
  userId!: string;

  @ApiProperty({ enum: LifecycleStatus })
  status!: LifecycleStatus;

  @ApiPropertyOptional({ nullable: true })
  onboardedAt?: string | null;

  @ApiPropertyOptional({ nullable: true })
  suspendedAt?: string | null;

  @ApiPropertyOptional({ nullable: true })
  terminatedAt?: string | null;

  @ApiPropertyOptional({ nullable: true })
  terminationReason?: string | null;

  @ApiProperty()
  offboardingCompleted!: boolean;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}
