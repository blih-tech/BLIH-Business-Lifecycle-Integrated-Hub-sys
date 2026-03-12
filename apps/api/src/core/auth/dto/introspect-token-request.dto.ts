import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class IntrospectTokenRequestDto {
  @ApiProperty({
    description: 'Access token to introspect.',
    example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  token!: string;
}
