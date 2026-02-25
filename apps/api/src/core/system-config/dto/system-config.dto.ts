import { IsObject, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type { SystemConfigDto as SystemConfigDtoType } from '@repo/types';

export class SystemConfigDto implements SystemConfigDtoType {
  @ApiProperty({
    description: 'Configuration key.',
    example: 'auth.session',
  })
  @IsString()
  key!: string;

  @ApiProperty({
    description: 'Configuration payload value.',
    type: 'object',
    additionalProperties: true,
    example: { timeoutMinutes: 30, rememberMe: false },
  })
  @IsObject()
  value!: Record<string, unknown>;
}
