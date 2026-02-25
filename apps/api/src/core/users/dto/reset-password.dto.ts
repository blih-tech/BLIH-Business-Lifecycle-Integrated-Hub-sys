import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';
import type { ResetPasswordDto as ResetPasswordDtoType } from '@repo/types';

export class ResetPasswordDto implements ResetPasswordDtoType {
  @ApiProperty({
    description: 'New password for the target user.',
    minLength: 8,
    example: 'S3curePassw0rd!',
  })
  @IsString()
  @MinLength(8)
  password!: string;
}
