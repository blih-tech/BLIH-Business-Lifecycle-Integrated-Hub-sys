import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { UserProfileResponseDto as UserProfileResponseDtoType } from '@repo/types';

export class UserProfileResponseDto implements UserProfileResponseDtoType {
  @ApiProperty()
  userId!: string;

  @ApiPropertyOptional({ nullable: true })
  dateOfBirth?: string | null;

  @ApiPropertyOptional({ nullable: true })
  gender?: string | null;

  @ApiPropertyOptional({ nullable: true })
  nationality?: string | null;

  @ApiPropertyOptional({ nullable: true })
  maritalStatus?: string | null;

  @ApiPropertyOptional({ nullable: true })
  avatarUrl?: string | null;

  @ApiPropertyOptional({ nullable: true })
  addressLine1?: string | null;

  @ApiPropertyOptional({ nullable: true })
  addressLine2?: string | null;

  @ApiPropertyOptional({ nullable: true })
  city?: string | null;

  @ApiPropertyOptional({ nullable: true })
  state?: string | null;

  @ApiPropertyOptional({ nullable: true })
  country?: string | null;

  @ApiPropertyOptional({ nullable: true })
  postalCode?: string | null;

  @ApiPropertyOptional({ nullable: true })
  emergencyContactName?: string | null;

  @ApiPropertyOptional({ nullable: true })
  emergencyContactPhone?: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}
