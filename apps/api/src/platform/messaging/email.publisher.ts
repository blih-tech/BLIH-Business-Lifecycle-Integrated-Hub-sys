/* eslint-disable @typescript-eslint/no-base-to-string */
import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import notificationConfig from '../../config/notification.config';
import { NotificationMessage } from '../../shared/interfaces/notification-message.interface';

@Injectable()
export class EmailPublisher {
  constructor(
    @Inject(notificationConfig.KEY)
    private readonly notificationSettings: ConfigType<
      typeof notificationConfig
    >,
  ) {}

  async send(
    message: NotificationMessage,
  ): Promise<{ accepted: string[]; rejected: string[] }> {
    if (!this.notificationSettings.smtpEnabled) {
      return { accepted: [], rejected: message.recipients };
    }

    const transport = nodemailer.createTransport({
      host: this.notificationSettings.smtpHost,
      port: this.notificationSettings.smtpPort,
      secure: this.notificationSettings.smtpSecure,
      auth: {
        user: this.notificationSettings.smtpUser,
        pass: this.notificationSettings.smtpPassword,
      },
    });

    const result = await transport.sendMail({
      from: this.notificationSettings.emailFrom,
      to: message.recipients.join(','),
      subject: message.subject,
      text: message.body,
      html: `<p>${message.body}</p>`,
    });

    return {
      accepted: result.accepted.map((entry) => String(entry)),
      rejected: result.rejected.map((entry) => String(entry)),
    };
  }
}
