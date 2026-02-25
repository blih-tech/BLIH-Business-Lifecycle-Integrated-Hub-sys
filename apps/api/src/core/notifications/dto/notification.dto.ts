import { IsArray, IsIn, IsObject, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { NotificationDto as NotificationDtoType } from '@repo/types';

export class NotificationDto implements NotificationDtoType {
  @ApiProperty({
    description: 'Notification domain type.',
    example: 'security',
  })
  @IsString()
  type!: string;

  @ApiProperty({
    description: 'Priority level.',
    enum: ['low', 'medium', 'high', 'critical'],
    example: 'high',
  })
  @IsIn(['low', 'medium', 'high', 'critical'])
  priority!: 'low' | 'medium' | 'high' | 'critical';

  @ApiProperty({
    description: 'Notification title.',
    example: 'Suspicious Login Detected',
  })
  @IsString()
  title!: string;

  @ApiProperty({
    description: 'Notification body text.',
    example: 'A privileged account logged in from a new location.',
  })
  @IsString()
  body!: string;

  @ApiPropertyOptional({
    description: 'Single user id for in-app targeted delivery.',
    example: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374',
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({
    description: 'Email recipients or recipient identifiers.',
    type: [String],
    example: ['secops@blih.local'],
  })
  @IsArray()
  @IsString({ each: true })
  recipients!: string[];

  @ApiProperty({
    description: 'Delivery channels.',
    enum: ['email', 'webhook', 'in_app'],
    isArray: true,
    example: ['email', 'in_app'],
  })
  @IsArray()
  @IsIn(['email', 'webhook', 'in_app'], { each: true })
  channels!: Array<'email' | 'webhook' | 'in_app'>;

  @ApiPropertyOptional({
    description: 'Webhook endpoint URL for webhook channel.',
    example: 'https://hooks.example.com/blih-security',
  })
  @IsOptional()
  @IsString()
  webhookUrl?: string;

  @ApiPropertyOptional({
    description: 'Arbitrary notification payload forwarded to channels.',
    type: 'object',
    additionalProperties: true,
    example: { ip: '10.10.1.10', severity: 'critical' },
  })
  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;
}
