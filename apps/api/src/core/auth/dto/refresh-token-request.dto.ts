import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import type { RefreshTokenRequestDto as RefreshTokenRequestDtoType } from '@repo/types';

export class RefreshTokenRequestDto implements RefreshTokenRequestDtoType {
  @ApiProperty({
    description: 'Refresh token used to issue a new access token.',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  token!: string;
}
