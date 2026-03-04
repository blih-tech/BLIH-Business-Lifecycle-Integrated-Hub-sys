import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../../platform/prisma/prisma-client';
import { PrismaService } from '../../../platform/prisma/prisma.service';

@Injectable()
export class RecruitmentNotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async notifyUsers(input: {
    userIds: Array<string | null | undefined>;
    title: string;
    body: string;
    type?: string;
    priority?: string;
    payload?: Record<string, unknown>;
  }) {
    const userIds = [
      ...new Set(
        input.userIds.filter((value): value is string => Boolean(value)),
      ),
    ];
    if (userIds.length === 0) return;

    await this.prisma.notification.createMany({
      data: userIds.map((userId) => ({
        userId,
        type: input.type ?? 'recruitment',
        priority: input.priority ?? 'medium',
        title: input.title,
        body: input.body,
        payload: input.payload as Prisma.InputJsonValue | undefined,
      })),
    });
  }
}
