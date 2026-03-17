import { Injectable } from '@nestjs/common';
import {
  NotificationChannel,
  NotificationStatus,
  Prisma,
} from '../../../platform/prisma/prisma-client';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import { NotificationMessage } from '../../../shared/interfaces/notification-message.interface';
import { NotificationsGateway } from '../notifications.gateway';
import { NotificationDto } from '../dto/notification.dto';
import { SendEmailUseCase } from './send-email.usecase';
import { SendWebhookUseCase } from './send-webhook.usecase';

@Injectable()
export class SendNotificationUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sendEmailUseCase: SendEmailUseCase,
    private readonly sendWebhookUseCase: SendWebhookUseCase,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async execute(dto: NotificationDto) {
    const notification = await this.prisma.notification.create({
      data: {
        userId: dto.userId,
        type: dto.type,
        priority: dto.priority,
        title: dto.title,
        body: dto.body,
        payload: dto.payload as Prisma.InputJsonValue | undefined,
      },
    });

    const message: NotificationMessage = {
      type: dto.type,
      priority: dto.priority,
      recipients: dto.recipients,
      subject: dto.title,
      body: dto.body,
      payload: dto.payload,
      webhookUrl: dto.webhookUrl,
      userId: dto.userId,
    };

    const deliveries: Prisma.NotificationDeliveryCreateManyInput[] = [];

    for (const channel of dto.channels) {
      if (channel === 'email') {
        const emailResult = await this.sendEmailUseCase.execute(message);
        deliveries.push(
          ...dto.recipients.map((recipient) => ({
            notificationId: notification.id,
            channel: NotificationChannel.EMAIL,
            status: emailResult.accepted.includes(recipient)
              ? NotificationStatus.SENT
              : NotificationStatus.FAILED,
            recipient,
            response: emailResult as unknown as Prisma.InputJsonValue,
            errorMessage: emailResult.accepted.includes(recipient)
              ? undefined
              : 'Recipient rejected by SMTP gateway',
          })),
        );
      }

      if (channel === 'webhook' && dto.webhookUrl) {
        try {
          const webhookResult = await this.sendWebhookUseCase.execute(message);
          deliveries.push({
            notificationId: notification.id,
            channel: NotificationChannel.WEBHOOK,
            status:
              webhookResult.statusCode >= 200 && webhookResult.statusCode < 300
                ? NotificationStatus.SENT
                : NotificationStatus.FAILED,
            recipient: dto.webhookUrl,
            response: webhookResult as unknown as Prisma.InputJsonValue,
            errorMessage:
              webhookResult.statusCode >= 200 && webhookResult.statusCode < 300
                ? undefined
                : 'Webhook endpoint returned non-2xx response',
          });
        } catch (error) {
          deliveries.push({
            notificationId: notification.id,
            channel: NotificationChannel.WEBHOOK,
            status: NotificationStatus.FAILED,
            recipient: dto.webhookUrl,
            errorMessage:
              error instanceof Error
                ? error.message
                : 'Webhook delivery failed',
          });
        }
      }

      if (channel === 'in_app') {
        deliveries.push(
          ...dto.recipients.map((recipient) => ({
            notificationId: notification.id,
            channel: NotificationChannel.IN_APP,
            status: NotificationStatus.SENT,
            recipient,
          })),
        );
      }
    }

    if (deliveries.length > 0) {
      await this.prisma.notificationDelivery.createMany({
        data: deliveries,
      });
    }

    if (dto.userId) {
      this.notificationsGateway.pushToUser(dto.userId, {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        body: notification.body,
      });
    } else {
      this.notificationsGateway.broadcast({
        id: notification.id,
        type: notification.type,
        title: notification.title,
        body: notification.body,
      });
    }

    return {
      notification,
      deliveries,
    };
  }
}
