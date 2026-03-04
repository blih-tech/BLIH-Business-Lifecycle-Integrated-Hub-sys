import { IsEmail, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import type { UpdateUserDto as UpdateUserDtoType } from '@repo/types';

export class UpdateUserDto implements UpdateUserDtoType {
  @ApiPropertyOptional({
    description: 'Updated email address.',
    example: 'jane.updated@blih.local',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Updated first name.',
    example: 'Janet',
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Updated last name.',
    example: 'Doe',
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Updated phone number.',
    example: '+12025550000',
  })
  @IsOptional()
  @IsString()
  phone?: string;
}
