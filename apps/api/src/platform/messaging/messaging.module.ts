import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { WebhookPublisher } from './webhook.publisher';
import { EmailPublisher } from './email.publisher';

@Module({
  imports: [HttpModule],
  providers: [WebhookPublisher, EmailPublisher],
  exports: [WebhookPublisher, EmailPublisher],
})
export class MessagingModule {}
