import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import type { RevokeSessionRequestDto as RevokeSessionRequestDtoType } from '@repo/types';

export class RevokeSessionRequestDto implements RevokeSessionRequestDtoType {
  @ApiProperty({
    description: 'Token to revoke.',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  token!: string;

  @ApiPropertyOptional({
    description: 'Hint for the token type being revoked.',
    enum: ['refresh_token', 'access_token'],
    example: 'refresh_token',
  })
  @IsOptional()
  @IsIn(['refresh_token', 'access_token'])
  tokenTypeHint?: 'refresh_token' | 'access_token';

  @ApiPropertyOptional({
    description: 'Human-readable reason for revocation.',
    example: 'user_logout',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
