import { ApiProperty } from '@nestjs/swagger';
import { AuthMeAuthDto } from './auth-me-auth.dto';
import { AuthMeUserDto } from './auth-me-user.dto';

export class AuthMeResponseDto {
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
