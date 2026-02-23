import { IsBoolean, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SecurityPolicyDto {
  @ApiProperty({
    description: 'Require multi-factor authentication for user login.',
    example: true,
  })
  @IsBoolean()
  requireMfa!: boolean;

  @ApiProperty({
    description: 'Maximum active sessions per user.',
    minimum: 1,
    example: 3,
  })
  @IsInt()
  @Min(1)
  maxConcurrentSessions!: number;

  @ApiProperty({
    description: 'Session timeout in minutes.',
    minimum: 1,
    example: 480,
  })
  @IsInt()
  @Min(1)
  sessionTimeoutMinutes!: number;

  @ApiProperty({
    description: 'Minimum password length.',
    minimum: 8,
    example: 12,
  })
  @IsInt()
  @Min(8)
  passwordMinLength!: number;

  @ApiProperty({
    description: 'Failed login attempts before lockout.',
    minimum: 1,
    example: 5,
  })
  @IsInt()
  @Min(1)
  lockoutThreshold!: number;
}
