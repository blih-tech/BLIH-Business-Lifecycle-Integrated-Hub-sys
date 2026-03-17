export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';
export type NotificationChannel = 'email' | 'webhook' | 'in_app';

export interface NotificationDto {
  type: string;
  priority: NotificationPriority;
  title: string;
  body: string;
  userId?: string;
  recipients: string[];
  channels: NotificationChannel[];
  webhookUrl?: string;
  payload?: Record<string, unknown>;
}
