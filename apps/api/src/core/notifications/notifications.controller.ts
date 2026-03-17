import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Audit } from '../../shared/decorators/audit.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import { ResponseMessage } from '../../shared/decorators/response-message.decorator';
import { ApiDefaultErrors, ApiProtected } from '../../shared/docs/openapi';
import { KeycloakAuthGuard } from '../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../shared/guards/rbac.guard';
import { PrismaService } from '../../platform/prisma/prisma.service';
import { SystemNotificationPermissions } from '@repo/types/rbac';
import { NotificationDto } from './dto/notification.dto';
import { NotifySecurityEventUseCase } from './use-cases/notify-security-event.usecase';
import { SendNotificationUseCase } from './use-cases/send-notification.usecase';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class NotificationsController {
  constructor(
    private readonly sendNotificationUseCase: SendNotificationUseCase,
    private readonly notifySecurityEventUseCase: NotifySecurityEventUseCase,
    private readonly prisma: PrismaService,
  ) {}

  @Post('send')
  @Roles(SystemNotificationPermissions.SEND)
  @Audit('notification.send', 'system.notifications')
  @ApiProtected({
    path: '/api/v1/notifications/send',
    roles: ['system_notification:send'],
  })
  @ApiOperation({
    summary: 'Send notification',
    description:
      'Sends a notification across selected channels (email/webhook/in-app) and stores delivery records. Requires role `system_notification:send`.',
  })
  @ApiBody({
    type: NotificationDto,
    examples: {
      sendNotification: {
        summary: 'Send notification payload',
        value: {
          type: 'operations',
          priority: 'high',
          title: 'Deployment Completed',
          body: 'Finance module deployment succeeded.',
          userId: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374',
          recipients: ['ops@blih.local'],
          channels: ['email', 'in_app'],
          payload: { deploymentId: 'dep-774' },
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Notification sent and delivery attempts recorded.',
    schema: {
      example: {
        notification: {
          id: 'ceb32f5d-2a14-49f2-b739-6dfcc1fc6bc1',
          userId: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374',
          type: 'operations',
          priority: 'high',
          title: 'Deployment Completed',
          body: 'Finance module deployment succeeded.',
          payload: { deploymentId: 'dep-774' },
          readAt: null,
          createdAt: '2026-02-15T11:00:00.000Z',
        },
        deliveries: [
          {
            notificationId: 'ceb32f5d-2a14-49f2-b739-6dfcc1fc6bc1',
            channel: 'EMAIL',
            status: 'SENT',
            recipient: 'ops@blih.local',
            errorMessage: null,
          },
        ],
      },
    },
  })
  @ApiDefaultErrors({
    path: '/api/v1/notifications/send',
    badRequest: {
      message: ['channels must contain only allowed values'],
      error: 'Bad Request',
      statusCode: 400,
    },
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  @ResponseMessage('Notification sent successfully')
  async send(@Body() dto: NotificationDto) {
    return this.sendNotificationUseCase.execute(dto);
  }

  @Post('security-event')
  @Roles(SystemNotificationPermissions.SEND)
  @Audit('notification.security-event', 'system.notifications')
  @ApiProtected({
    path: '/api/v1/notifications/security-event',
    roles: ['system_notification:send'],
  })
  @ApiOperation({
    summary: 'Send security event notification',
    description:
      'Sends a critical notification classified as `security` with forced critical priority. Requires role `system_notification:send`.',
  })
  @ApiBody({
    type: NotificationDto,
    examples: {
      securityEvent: {
        summary: 'Security event payload',
        value: {
          type: 'security',
          priority: 'critical',
          title: 'Privileged Access Alert',
          body: 'Privileged user logged in without expected device fingerprint.',
          recipients: ['secops@blih.local'],
          channels: ['email', 'webhook'],
          webhookUrl: 'https://hooks.example.com/security',
          payload: { severity: 'critical', ip: '10.10.1.10' },
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Security event notification sent.',
    schema: {
      example: {
        notification: {
          id: 'e0d8a85f-1677-4378-93fa-d3f86a98eb85',
          userId: null,
          type: 'security',
          priority: 'critical',
          title: 'Privileged Access Alert',
          body: 'Privileged user logged in without expected device fingerprint.',
          payload: { severity: 'critical', ip: '10.10.1.10' },
          readAt: null,
          createdAt: '2026-02-15T11:05:00.000Z',
        },
        deliveries: [
          {
            notificationId: 'e0d8a85f-1677-4378-93fa-d3f86a98eb85',
            channel: 'EMAIL',
            status: 'SENT',
            recipient: 'secops@blih.local',
          },
        ],
      },
    },
  })
  @ApiDefaultErrors({
    path: '/api/v1/notifications/security-event',
    badRequest: {
      message: ['type must be a string'],
      error: 'Bad Request',
      statusCode: 400,
    },
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  @ResponseMessage('Security event notification sent successfully')
  async security(@Body() dto: NotificationDto) {
    return this.notifySecurityEventUseCase.execute(dto);
  }

  @Get('inbox/:userId')
  @Roles(SystemNotificationPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/notifications/inbox/:userId',
    roles: ['system_notification:view'],
  })
  @ApiOperation({
    summary: 'Get user inbox',
    description:
      'Returns persisted notifications for a specific user sorted by newest first.',
  })
  @ApiParam({
    name: 'userId',
    description: 'Target user id.',
    example: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374',
  })
  @ApiOkResponse({
    description: 'Notification inbox records.',
    schema: {
      example: [
        {
          id: 'ceb32f5d-2a14-49f2-b739-6dfcc1fc6bc1',
          userId: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374',
          type: 'operations',
          priority: 'high',
          title: 'Deployment Completed',
          body: 'Finance module deployment succeeded.',
          payload: { deploymentId: 'dep-774' },
          readAt: null,
          createdAt: '2026-02-15T11:00:00.000Z',
        },
      ],
    },
  })
  @ApiDefaultErrors({
    path: '/api/v1/notifications/inbox/0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  @ResponseMessage('User inbox retrieved successfully')
  async inbox(@Param('userId') userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Patch(':notificationId/read')
  @Roles(SystemNotificationPermissions.VIEW)
  @Audit('notification.mark-read', 'system.notifications')
  @ApiProtected({
    path: '/api/v1/notifications/:notificationId/read',
    roles: ['system_notification:view'],
  })
  @ApiOperation({
    summary: 'Mark notification as read',
    description:
      'Marks a notification as read by setting its `readAt` timestamp to the current server time.',
  })
  @ApiParam({
    name: 'notificationId',
    description: 'Notification id to update.',
    example: 'ceb32f5d-2a14-49f2-b739-6dfcc1fc6bc1',
  })
  @ApiOkResponse({
    description: 'Notification updated with read timestamp.',
    schema: {
      example: {
        id: 'ceb32f5d-2a14-49f2-b739-6dfcc1fc6bc1',
        userId: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374',
        type: 'operations',
        priority: 'high',
        title: 'Deployment Completed',
        body: 'Finance module deployment succeeded.',
        payload: { deploymentId: 'dep-774' },
        readAt: '2026-02-15T11:30:00.000Z',
        createdAt: '2026-02-15T11:00:00.000Z',
      },
    },
  })
  @ApiDefaultErrors({
    path: '/api/v1/notifications/ceb32f5d-2a14-49f2-b739-6dfcc1fc6bc1/read',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
    notFound: 'Record to update not found',
  })
  @ResponseMessage('Notification marked as read successfully')
  async markRead(@Param('notificationId') notificationId: string) {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { readAt: new Date() },
    });
  }
}
