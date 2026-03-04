import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapAssetProvisioningResponse } from '../asset-provisioning.mapper';
import { OnboardingLifecycleService } from '../onboarding-lifecycle.service';

type ApprovalRole = 'IT_SUPERVISOR' | 'ADMIN' | 'FINANCE';

@Injectable()
export class ApproveAssetProvisioningUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly lifecycle: OnboardingLifecycleService,
  ) {}

  async execute(
    id: string,
    body: { role: ApprovalRole; approvedAt?: string | null },
  ) {
    const provisioning = await this.prisma.assetProvisioning.findUnique({
      where: { id },
    });
    if (!provisioning)
      throw new NotFoundException('Asset provisioning not found');
    if (provisioning.status === 'REJECTED') {
      throw new BadRequestException('Rejected provisioning cannot be approved');
    }

    const approvedAt = body.approvedAt ? new Date(body.approvedAt) : new Date();

    if (body.role === 'IT_SUPERVISOR') {
      const updated = await this.prisma.assetProvisioning.update({
        where: { id },
        data: {
          itSupervisorApprovedAt: approvedAt,
          status: 'PENDING',
        },
      });
      return mapAssetProvisioningResponse(updated);
    }

    if (!provisioning.itSupervisorApprovedAt) {
      throw new BadRequestException('IT supervisor approval is required first');
    }

    if (body.role === 'ADMIN') {
      const updated = await this.prisma.assetProvisioning.update({
        where: { id },
        data: {
          adminApprovedAt: approvedAt,
          status: provisioning.financeApprovalRequired ? 'PENDING' : 'APPROVED',
        },
      });

      if (!updated.financeApprovalRequired) {
        await this.lifecycle.activateEmployeeIfEligible(updated.employeeId);
      }
      return mapAssetProvisioningResponse(updated);
    }

    if (!provisioning.adminApprovedAt) {
      throw new BadRequestException(
        'Admin approval is required before finance approval',
      );
    }
    if (!provisioning.financeApprovalRequired) {
      throw new BadRequestException(
        'Finance approval is not required for this provisioning',
      );
    }

    const updated = await this.prisma.assetProvisioning.update({
      where: { id },
      data: {
        status: 'APPROVED',
        platformPermissions: {
          ...(provisioning.platformPermissions as Record<
            string,
            unknown
          > | null),
          financeApprovedAt: approvedAt.toISOString(),
        } as never,
      },
    });
    await this.lifecycle.activateEmployeeIfEligible(updated.employeeId);
    return mapAssetProvisioningResponse(updated);
  }
}
