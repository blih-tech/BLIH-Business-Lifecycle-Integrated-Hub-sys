import { IsIn, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TokenRequestDto {
  @ApiProperty({
    description: 'JWT token to validate/introspect/exchange/revoke/refresh.',
    example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  token!: string;

  @ApiPropertyOptional({
    description:
      'User subject to impersonate during token exchange (Keycloak requested_subject).',
    example: '01f03d85-53b1-4b85-857d-47bc57f0f63d',
  })
  @IsOptional()
  @IsString()
  requestedSubject?: string;

  @ApiPropertyOptional({
    description: 'Token hint for session revocation endpoint.',
    enum: ['refresh_token', 'access_token'],
    example: 'refresh_token',
  })
  @IsOptional()
  @IsIn(['refresh_token', 'access_token'])
  tokenTypeHint?: 'refresh_token' | 'access_token';

  @ApiPropertyOptional({
    description: 'Human-readable reason for session revocation.',
    example: 'manual_logout',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
