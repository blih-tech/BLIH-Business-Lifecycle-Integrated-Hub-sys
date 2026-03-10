import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';

@Injectable()
export class OnboardingLifecycleService {
  constructor(private readonly prisma: PrismaService) {}

  async activateEmployeeIfEligible(employeeId: string): Promise<boolean> {
    const [latestChecklist, latestAssetProvisioning, latestPolicyAck] =
      await Promise.all([
        this.prisma.onbosardingChecklist.findFirst({
          where: { employeeId },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            onboardingId: true,
            status: true,
          },
        }),
        this.prisma.assetProvisioning.findFirst({
          where: { employeeId },
          orderBy: { createdAt: 'desc' },
          select: {
            status: true,
          },
        }),
        this.prisma.policyAcknowledgement.findFirst({
          where: { employeeId },
          orderBy: { createdAt: 'desc' },
          select: {
            allAcknowledged: true,
            verifiedAt: true,
            systemAccessGrantedAt: true,
          },
        }),
      ]);

    if (!latestChecklist || latestChecklist.status !== 'COMPLETED') {
      return false;
    }

    if (
      latestAssetProvisioning &&
      !['APPROVED', 'PROVISIONED', 'COMPLETED'].includes(
        latestAssetProvisioning.status,
      )
    ) {
      return false;
    }

    if (
      latestPolicyAck &&
      (!latestPolicyAck.allAcknowledged ||
        !latestPolicyAck.verifiedAt ||
        !latestPolicyAck.systemAccessGrantedAt)
    ) {
      return false;
    }

    const now = new Date();
    await this.prisma.$transaction(async (tx) => {
      await tx.userLifecycle.upsert({
        where: { employeeId },
        update: {
          status: 'ACTIVE',
          onboardedAt: now,
        },
        create: {
          employeeId,
          status: 'ACTIVE',
          onboardedAt: now,
        },
      });

      if (latestChecklist.onboardingId) {
        await tx.onboarding.update({
          where: { id: latestChecklist.onboardingId },
          data: {
            status: 'COMPLETED',
            completedAt: now,
          },
        });
      }
    });

    return true;
  }
}
