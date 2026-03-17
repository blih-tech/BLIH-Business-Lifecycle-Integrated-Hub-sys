import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { RevokeSessionResponseDto as RevokeSessionResponseDtoType } from '@repo/types';

export class RevokeSessionResponseDto implements RevokeSessionResponseDtoType {
  @ApiProperty({
    description: 'Whether the token/session revocation operation succeeded.',
    example: true,
  })
  revoked!: boolean;

  @ApiPropertyOptional({
    description:
      'Token subject (sub) resolved from introspection when available.',
    example: '65c827f5-96d6-4ad7-8f4a-80df9794ac2d',
  })
  subject?: string;

  @ApiPropertyOptional({
    description: 'Keycloak session identifier resolved from introspection.',
    example: '4f5c57c7-4f17-4171-a23a-53f38eb9f7c8',
  })
  sessionId?: string;

  @ApiProperty({
    description: 'Hint for the token type revoked.',
    enum: ['refresh_token', 'access_token'],
    example: 'refresh_token',
  })
  tokenTypeHint!: 'refresh_token' | 'access_token';

  @ApiProperty({
    description: 'Human-readable reason recorded for revocation.',
    example: 'user_logout',
  })
  reason!: string;
}
