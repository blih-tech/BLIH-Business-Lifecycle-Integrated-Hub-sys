import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuthMeUserDto {
  @ApiProperty({
    description: 'Internal user id for the authenticated subject.',
    example: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374',
  })
  id!: string;

  @ApiProperty({
    description: 'Keycloak subject identifier.',
    example: '65c827f5-96d6-4ad7-8f4a-80df9794ac2d',
  })
  keycloakId!: string;

  @ApiPropertyOptional({
    description: 'Username from identity provider context.',
    example: 'admin1',
  })
  username?: string;

  @ApiProperty({
    description: 'Authenticated user email address.',
    example: 'admin@blih.local',
  })
  email!: string;

  @ApiPropertyOptional({
    description: 'First name.',
    example: 'Admin',
  })
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Last name.',
    example: 'User',
  })
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Phone number.',
    example: '+12025550199',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Account status.',
    enum: ['ACTIVE', 'DISABLED', 'PENDING'],
    example: 'ACTIVE',
  })
  status?: string;

  @ApiPropertyOptional({
    description: 'Position/job title.',
    example: 'System Administrator',
  })
  position?: string;
}
