import { Injectable } from '@nestjs/common';
import { WebhookPublisher } from '../../../platform/messaging/webhook.publisher';
import { NotificationMessage } from '../../../shared/interfaces/notification-message.interface';

@Injectable()
export class SendWebhookUseCase {
  constructor(private readonly webhookPublisher: WebhookPublisher) {}

  execute(message: NotificationMessage) {
    return this.webhookPublisher.send(message);
  }
}
