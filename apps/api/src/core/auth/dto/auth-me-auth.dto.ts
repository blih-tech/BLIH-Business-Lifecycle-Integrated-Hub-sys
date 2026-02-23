import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuthMeAuthDto {
  @ApiProperty({
    description: 'Authenticated subject identifier from access token.',
    example: '65c827f5-96d6-4ad7-8f4a-80df9794ac2d',
  })
  sub!: string;

  @ApiProperty({
    description: 'Resolved role names.',
    type: [String],
    example: ['superadmin'],
  })
  roles!: string[];

  @ApiProperty({
    description: 'Resolved permission keys.',
    type: [String],
    example: ['user:view', 'user:update'],
  })
  permissions!: string[];

  @ApiProperty({
    description: 'OAuth scopes resolved from token claims.',
    type: [String],
    example: ['roles', 'openid'],
  })
  scopes!: string[];

  @ApiPropertyOptional({
    description: 'Keycloak session id.',
    example: '4f5c57c7-4f17-4171-a23a-53f38eb9f7c8',
  })
  sessionId?: string;

  @ApiPropertyOptional({
    description: 'Authorized party/client id.',
    example: 'blih-system-api',
  })
  clientId?: string;
}
