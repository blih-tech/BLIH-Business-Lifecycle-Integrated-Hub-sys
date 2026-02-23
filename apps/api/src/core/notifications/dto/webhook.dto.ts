import { IsObject, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WebhookDto {
  @ApiProperty({
    description: 'Destination webhook URL.',
    example: 'https://hooks.example.com/core-events',
  })
  @IsUrl()
  url!: string;

  @ApiProperty({
    description: 'Webhook payload body.',
    type: 'object',
    additionalProperties: true,
    example: { eventType: 'system.user.created' },
  })
  @IsObject()
  payload!: Record<string, unknown>;
}
