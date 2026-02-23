import { Injectable } from '@nestjs/common';
import { NotificationDto } from '../dto/notification.dto';
import { SendNotificationUseCase } from './send-notification.usecase';

@Injectable()
export class NotifySecurityEventUseCase {
  constructor(
    private readonly sendNotificationUseCase: SendNotificationUseCase,
  ) {}

  execute(dto: NotificationDto) {
    return this.sendNotificationUseCase.execute({
      ...dto,
      type: 'security',
      priority: 'critical',
      title: dto.title,
      body: dto.body,
    });
  }
}
