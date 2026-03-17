import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import type { ExchangeTokenRequestDto as ExchangeTokenRequestDtoType } from '@repo/types';

export class ExchangeTokenRequestDto implements ExchangeTokenRequestDtoType {
  @ApiProperty({
    description: 'Subject access token used for token exchange.',
    example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  token!: string;

  @ApiPropertyOptional({
    description:
      'Optional target user subject for token exchange impersonation (requested_subject).',
    example: '01f03d85-53b1-4b85-857d-47bc57f0f63d',
  })
  @IsOptional()
  @IsString()
  requestedSubject?: string;
}
