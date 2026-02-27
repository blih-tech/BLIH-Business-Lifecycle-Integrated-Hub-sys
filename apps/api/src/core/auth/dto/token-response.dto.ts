import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { TokenResponseDto as TokenResponseDtoType } from '@repo/types';

export class TokenResponseDto implements TokenResponseDtoType {
  @ApiProperty({
    description: 'Whether token/session context is currently valid.',
    example: true,
  })
  active!: boolean;

  @ApiPropertyOptional({
    description: 'Authentication policy version applied by this service.',
    example: '2026.1',
  })
  policyVersion?: string;

  @ApiPropertyOptional({
    description: 'Authenticated subject identifier.',
    example: '65c827f5-96d6-4ad7-8f4a-80df9794ac2d',
  })
  sub?: string;

  @ApiPropertyOptional({
    description: 'Email address mapped from token claims.',
    example: 'admin@blih.local',
  })
  email?: string;

  @ApiProperty({
    description: 'OAuth scopes resolved from token claims.',
    type: [String],
    example: ['openid', 'profile', 'email'],
  })
  scopes!: string[];

  @ApiProperty({
    description: 'Resolved role names.',
    type: [String],
    example: ['superadmin'],
  })
  roles!: string[];

  @ApiProperty({
    description:
      'Resolved permission keys (2-part resource:action only, dynamically evaluated).',
    type: [String],
    example: ['user:view', 'user:update'],
  })
  permissions!: string[];

  @ApiPropertyOptional({
    description: 'Access token returned by refresh or exchange operations.',
    example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken?: string;

  @ApiPropertyOptional({
    description: 'Refresh token returned by refresh or exchange operations.',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken?: string;
}
