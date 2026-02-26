import { IsArray, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type { AccessEvaluationDto as AccessEvaluationDtoType } from '@repo/types';

const PERMISSION_KEY_PATTERN = '^[a-z0-9_]+:[a-z0-9_*-]+$';

export class AccessEvaluationDto implements AccessEvaluationDtoType {
  @ApiProperty({
    description: 'Target user id or keycloak id for permission evaluation.',
    example: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374',
  })
  @IsString()
  userId!: string;

  @ApiProperty({
    description:
      'Permission keys required by the evaluated action (2-part resource:action only).',
    type: [String],
    example: ['invoice:view', 'invoice:approve'],
  })
  @IsArray()
  @Matches(new RegExp(PERMISSION_KEY_PATTERN), {
    each: true,
    message: 'Each required permission must be resource:action (2-part only)',
  })
  requiredPermissions!: string[];
}
