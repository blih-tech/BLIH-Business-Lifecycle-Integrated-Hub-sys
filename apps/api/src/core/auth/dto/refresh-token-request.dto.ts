import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import type { RefreshTokenRequestDto as RefreshTokenRequestDtoType } from '@repo/types';

export class RefreshTokenRequestDto implements RefreshTokenRequestDtoType {
  @ApiPropertyOptional({
    description:
      'Optional refresh token for utility clients. Browser flows omit this field and use the kc_refresh HttpOnly cookie instead.',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsOptional()
  @IsString()
  token?: string;
}
