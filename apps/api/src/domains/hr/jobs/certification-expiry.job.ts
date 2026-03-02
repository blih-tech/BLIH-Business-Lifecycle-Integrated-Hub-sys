import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../../platform/prisma/prisma.service';

@Injectable()
export class CertificationExpiryJob {
  private readonly logger = new Logger(CertificationExpiryJob.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron('0 0 9 * * *')
  async run(): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const in30 = new Date(today);
    in30.setDate(in30.getDate() + 30);
    const in7 = new Date(today);
    in7.setDate(in7.getDate() + 7);

    const expiring = await this.prisma.trainingCompletion.findMany({
      where: {
        expiryDate: { not: null, gte: today, lte: in30 },
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    for (const c of expiring) {
      if (!c.expiryDate) continue;
      const days = Math.ceil(
        (c.expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );
      await this.prisma.notification.create({
        data: {
          userId: c.userId,
          type: 'certification_expiry_warning',
          priority: days <= 7 ? 'high' : 'normal',
          title: 'Certification expiring soon',
          body: `Your certification "${c.title}" expires in ${days} days. Please renew.`,
          payload: {
            completionId: c.id,
            title: c.title,
            expiryDate: c.expiryDate.toISOString(),
          },
        },
      });
    }
    this.logger.log(
      `Certification expiry job: sent ${expiring.length} notification(s).`,
    );
  }
}
