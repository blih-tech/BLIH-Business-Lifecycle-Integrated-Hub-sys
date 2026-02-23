export interface NotificationMessage {
  type: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  recipients: string[];
  subject: string;
  body: string;
  payload?: Record<string, unknown>;
  webhookUrl?: string;
  userId?: string;
}
