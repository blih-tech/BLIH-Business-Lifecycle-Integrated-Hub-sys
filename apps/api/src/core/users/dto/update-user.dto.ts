import { IsEmail, IsOptional, IsString, IsUUID } from 'class-validator';
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

  @ApiPropertyOptional({
    description: 'Updated department id.',
    example: '1f31a301-dfb8-4071-aab1-ad6bc4891da7',
  })
  @IsOptional()
  @IsUUID()
  departmentId?: string;
}
