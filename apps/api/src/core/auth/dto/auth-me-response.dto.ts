import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { AuthMeResponseDto as AuthMeResponseDtoType } from '@repo/types';

export class AuthMeResponseDto implements AuthMeResponseDtoType {
  @ApiProperty({ example: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374' })
  id!: string;

  @ApiProperty({ example: '65c827f5-96d6-4ad7-8f4a-80df9794ac2d' })
  keycloakId!: string;

  @ApiPropertyOptional({ example: 'admin1' })
  username?: string;

  @ApiProperty({ example: 'admin@blih.local' })
  email!: string;

  @ApiPropertyOptional({ example: 'Admin' })
  firstName?: string;

  @ApiPropertyOptional({ example: 'User' })
  lastName?: string;

  @ApiPropertyOptional({ example: '+12025550199' })
  phone?: string;

  @ApiPropertyOptional({ example: 'ACTIVE' })
  status?: string;

  @ApiPropertyOptional({
    example: '1f31a301-dfb8-4071-aab1-ad6bc4891da7',
  })
  departmentId?: string | null;

  @ApiProperty({ example: '65c827f5-96d6-4ad7-8f4a-80df9794ac2d' })
  sub!: string;

  @ApiProperty({
    example: ['superadmin'],
  })
  roles!: string[];

  @ApiProperty({
    example: ['user:view', 'user:update'],
  })
  permissions!: string[];

  @ApiProperty({
    example: ['openid', 'profile', 'email'],
  })
  scopes!: string[];

  @ApiPropertyOptional({
    example: '4f5c57c7-4f17-4171-a23a-53f38eb9f7c8',
  })
  sessionId?: string;

  @ApiPropertyOptional({ example: 'blih-system-api' })
  clientId?: string;
}
