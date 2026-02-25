import { ApiProperty } from '@nestjs/swagger';
import { AuthMeAuthDto } from './auth-me-auth.dto';
import { AuthMeUserDto } from './auth-me-user.dto';
import type { AuthMeResponseDto as AuthMeResponseDtoType } from '@repo/types';

export class AuthMeResponseDto implements AuthMeResponseDtoType {
  @ApiProperty({
    description: 'Authenticated user profile context.',
    type: AuthMeUserDto,
  })
  user!: AuthMeUserDto;

  @ApiProperty({
    description: 'Authentication and authorization context.',
    type: AuthMeAuthDto,
  })
  auth!: AuthMeAuthDto;
}
