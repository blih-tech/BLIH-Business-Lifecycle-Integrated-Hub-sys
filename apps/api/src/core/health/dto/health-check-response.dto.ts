import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class HealthCheckItemResponseDto {
  @ApiProperty({ example: 'up', enum: ['up', 'down'] })
  status!: 'up' | 'down';

  @ApiPropertyOptional({ example: 'connect ECONNREFUSED' })
  error?: string;

  @ApiPropertyOptional({ example: 'disabled' })
  mode?: string;
}

class HealthChecksResponseDto {
  @ApiProperty({ type: HealthCheckItemResponseDto })
  database!: HealthCheckItemResponseDto;

  @ApiProperty({ type: HealthCheckItemResponseDto })
  keycloak!: HealthCheckItemResponseDto;

  @ApiProperty({ type: HealthCheckItemResponseDto })
  smtp!: HealthCheckItemResponseDto;
}

export class HealthCheckResponseDto {
  @ApiProperty({ example: 'degraded', enum: ['up', 'degraded'] })
  status!: 'up' | 'degraded';

  @ApiProperty({ type: HealthChecksResponseDto })
  checks!: HealthChecksResponseDto;

  @ApiProperty({ example: '2026-02-15T12:00:00.000Z' })
  timestamp!: string;
}
