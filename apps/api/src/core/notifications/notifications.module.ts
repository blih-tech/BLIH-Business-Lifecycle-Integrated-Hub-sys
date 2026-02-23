import { Module } from '@nestjs/common';
import { MessagingModule } from '../../platform/messaging/messaging.module';
import { NotificationsController } from './notifications.controller';
import { NotificationsGateway } from './notifications.gateway';
import { NotifySecurityEventUseCase } from './use-cases/notify-security-event.usecase';
import { SendEmailUseCase } from './use-cases/send-email.usecase';
import { SendNotificationUseCase } from './use-cases/send-notification.usecase';
import { SendWebhookUseCase } from './use-cases/send-webhook.usecase';

@Module({
  imports: [MessagingModule],
  controllers: [NotificationsController],
  providers: [
    NotificationsGateway,
    SendNotificationUseCase,
    SendEmailUseCase,
    SendWebhookUseCase,
    NotifySecurityEventUseCase,
  ],
})
export class NotificationsModule {}
