import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { CreateUserDto as CreateUserDtoType } from '@repo/types';

export class CreateUserDto implements CreateUserDtoType {
  @ApiProperty({
    description: 'Primary email address for the user (required).',
    example: 'jane.doe@blih.local',
  })
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'User first name.',
    example: 'Jane',
  })
  @IsString()
  firstName!: string;

  @ApiProperty({
    description: 'User last name.',
    example: 'Doe',
  })
  @IsString()
  lastName!: string;

  @ApiProperty({
    description: 'Login username (Keycloak and local DB). Unique per realm.',
    example: 'jane.doe',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9._-]+$/, {
    message:
      'username can only contain letters, numbers, dots, underscores, and hyphens',
  })
  username!: string;

  @ApiPropertyOptional({
    description: 'Phone number in local or E.164 format.',
    example: '+12025550199',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'Department id for this user.',
    format: 'uuid',
    example: '1f31a301-dfb8-4071-aab1-ad6bc4891da7',
  })
  @IsUUID()
  departmentId!: string;
}
