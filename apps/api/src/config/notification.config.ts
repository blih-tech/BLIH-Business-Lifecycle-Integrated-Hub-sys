import { registerAs } from '@nestjs/config';
import { env } from './env.config';

export interface NotificationConfig {
  smtpEnabled: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPassword: string;
  emailFrom: string;
}

export default registerAs(
  'notification',
  (): NotificationConfig => ({
    smtpEnabled: env.SMTP_ENABLED,
    smtpHost: env.SMTP_HOST,
    smtpPort: env.SMTP_PORT,
    smtpSecure: env.SMTP_SECURE,
    smtpUser: env.SMTP_USER,
    smtpPassword: env.SMTP_PASSWORD,
    emailFrom: env.EMAIL_FROM,
  }),
);
