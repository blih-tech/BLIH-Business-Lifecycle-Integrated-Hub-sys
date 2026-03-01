import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../../platform/prisma/prisma.service';

@Injectable()
export class DocumentExpiryJob {
  private readonly logger = new Logger(DocumentExpiryJob.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron('0 0 9 * * *')
  async run(): Promise<void> {
    const today = new Date();
    const in30 = new Date(today);
    in30.setDate(in30.getDate() + 30);
    const in7 = new Date(today);
    in7.setDate(in7.getDate() + 7);

    const expiringIn30 = await this.prisma.employeeDocument.findMany({
      where: {
        expiryDate: { not: null, gte: today, lte: in30 },
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    const expiringIn7 = await this.prisma.employeeDocument.findMany({
      where: {
        expiryDate: { not: null, gte: today, lte: in7 },
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    for (const doc of expiringIn30) {
      if (!doc.expiryDate) continue;
      const days = Math.ceil(
        (doc.expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );
      await this.prisma.notification.create({
        data: {
          userId: doc.userId,
          type: 'document_expiry_warning',
          priority: 'normal',
          title: 'Document expiring soon',
          body: `Your ${doc.type} document expires in ${days} days. Please renew.`,
          payload: {
            documentId: doc.id,
            type: doc.type,
            expiryDate: doc.expiryDate.toISOString(),
          },
        },
      });
    }

    for (const doc of expiringIn7) {
      if (!doc.expiryDate) continue;
      await this.prisma.notification.create({
        data: {
          userId: doc.userId,
          type: 'document_expiry_urgent',
          priority: 'high',
          title: 'Document expiring in 7 days',
          body: `Your ${doc.type} document expires soon. Please renew immediately.`,
          payload: {
            documentId: doc.id,
            type: doc.type,
            expiryDate: doc.expiryDate.toISOString(),
          },
        },
      });
    }

    this.logger.log(
      `Document expiry: ${expiringIn30.length} in 30 days, ${expiringIn7.length} in 7 days`,
    );
  }
}
