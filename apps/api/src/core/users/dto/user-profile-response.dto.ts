import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender, MaritalStatus } from '../../../platform/prisma/prisma-client';
import type { UserProfileResponseDto as UserProfileResponseDtoType } from '@repo/types';

export class UserProfileResponseDto implements UserProfileResponseDtoType {
  @ApiProperty({ example: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374' })
  userId!: string;

  @ApiPropertyOptional({ nullable: true, example: '1993-07-18' })
  dateOfBirth?: string | null;

  @ApiPropertyOptional({ nullable: true, enum: Gender, example: Gender.FEMALE })
  gender?: Gender | null;

  @ApiPropertyOptional({
    nullable: true,
    example: '7e782af1-7f33-49fd-b4d9-ae4868f5dd82',
  })
  nationalityId?: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'Ethiopian' })
  nationality?: string | null;

  @ApiPropertyOptional({
    nullable: true,
    enum: MaritalStatus,
    example: MaritalStatus.SINGLE,
  })
  maritalStatus?: MaritalStatus | null;

  @ApiPropertyOptional({
    nullable: true,
    example: 'https://cdn.blih.local/avatars/jane-doe.png',
  })
  avatarUrl?: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'Bole Road' })
  addressLine1?: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'Woreda 03' })
  addressLine2?: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'Addis Ababa' })
  city?: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'Addis Ababa' })
  state?: string | null;

  @ApiPropertyOptional({
    nullable: true,
    example: '2c3fdc4f-1f45-4314-bcc4-2506575dd2ec',
  })
  countryId?: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'Ethiopia' })
  country?: string | null;

  @ApiPropertyOptional({ nullable: true, example: '1000' })
  postalCode?: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'Abel Doe' })
  emergencyContactName?: string | null;

  @ApiPropertyOptional({ nullable: true, example: '+251911000000' })
  emergencyContactPhone?: string | null;

  @ApiProperty({ example: '2026-02-15T08:52:24.144Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-02-15T09:12:24.144Z' })
  updatedAt!: string;
}
