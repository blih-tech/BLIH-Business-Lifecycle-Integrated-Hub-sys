import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { UserResponseDto as UserResponseDtoType } from '@repo/types';

export class UserResponseDto implements UserResponseDtoType {
  @ApiProperty({
    description: 'Internal UUID of the user record.',
    example: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374',
  })
  id!: string;

  @ApiProperty({
    description: 'Keycloak subject identifier.',
    example: 'ae3fdb37-c555-4b17-b320-d5f8b435f667',
  })
  keycloakId!: string;

  @ApiProperty({
    description: 'Login username (unique per realm).',
    example: 'jane.doe',
  })
  username!: string;

  @ApiProperty({
    description: 'User email address.',
    example: 'jane.doe@blih.local',
  })
  email!: string;

  @ApiProperty({
    description: 'User first name.',
    example: 'Jane',
  })
  firstName!: string;

  @ApiProperty({
    description: 'User last name.',
    example: 'Doe',
  })
  lastName!: string;

  @ApiPropertyOptional({
    description: 'Phone number.',
    example: '+12025550199',
  })
  phone?: string;

  @ApiProperty({
    description: 'User account status.',
    enum: ['ACTIVE', 'DISABLED', 'PENDING'],
    example: 'ACTIVE',
  })
  status!: string;

  @ApiPropertyOptional({
    description: 'User job position.',
    example: 'Finance Analyst',
  })
  position?: string;

  @ApiProperty({
    description: 'Persisted effective permission keys for this user.',
    type: [String],
    example: ['user:view', 'invoice:create'],
  })
  permissions!: string[];

  @ApiProperty({
    description: 'Creation timestamp.',
    example: '2026-02-15T08:52:24.144Z',
  })
  createdAt!: string;

  @ApiProperty({
    description: 'Last update timestamp.',
    example: '2026-02-15T09:52:24.144Z',
  })
  updatedAt!: string;
}
