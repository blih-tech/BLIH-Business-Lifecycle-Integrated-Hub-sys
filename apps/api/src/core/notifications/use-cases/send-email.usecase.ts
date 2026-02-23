import { Injectable } from '@nestjs/common';
import { EmailPublisher } from '../../../platform/messaging/email.publisher';
import { NotificationMessage } from '../../../shared/interfaces/notification-message.interface';

@Injectable()
export class SendEmailUseCase {
  constructor(private readonly emailPublisher: EmailPublisher) {}

  execute(message: NotificationMessage) {
    return this.emailPublisher.send(message);
  }
}
