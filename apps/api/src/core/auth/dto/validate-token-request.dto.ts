import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import type { ValidateTokenRequestDto as ValidateTokenRequestDtoType } from '@repo/types';

export class ValidateTokenRequestDto implements ValidateTokenRequestDtoType {
  @ApiProperty({
    description: 'Access token to validate.',
    example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  token!: string;
}
