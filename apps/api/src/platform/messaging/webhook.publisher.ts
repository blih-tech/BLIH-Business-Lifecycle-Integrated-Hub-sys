import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { NotificationMessage } from '../../shared/interfaces/notification-message.interface';

@Injectable()
export class WebhookPublisher {
  constructor(private readonly httpService: HttpService) {}

  async send(
    message: NotificationMessage,
  ): Promise<{ statusCode: number; body: unknown }> {
    if (!message.webhookUrl) {
      return { statusCode: 400, body: { error: 'webhookUrl not provided' } };
    }

    const response = await firstValueFrom(
      this.httpService.post(message.webhookUrl, {
        type: message.type,
        priority: message.priority,
        subject: message.subject,
        body: message.body,
        payload: message.payload,
      }),
    );

    return { statusCode: response.status, body: response.data };
  }
}
