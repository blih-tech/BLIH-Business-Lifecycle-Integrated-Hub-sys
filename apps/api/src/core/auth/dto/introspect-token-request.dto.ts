import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import type { IntrospectTokenRequestDto as IntrospectTokenRequestDtoType } from '@repo/types';

export class IntrospectTokenRequestDto implements IntrospectTokenRequestDtoType {
  @ApiProperty({
    description: 'Access token to introspect.',
    example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  token!: string;
}
