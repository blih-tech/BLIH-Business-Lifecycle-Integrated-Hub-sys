import { Injectable, NotFoundException } from '@nestjs/common';
import type { UpdateAssetProvisioningDto } from '@repo/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapAssetProvisioningResponse } from '../asset-provisioning.mapper';
import { shouldRequireFinanceApproval } from '../asset-provisioning.utils';
import { OnboardingLifecycleService } from '../onboarding-lifecycle.service';

@Injectable()
export class UpdateAssetProvisioningUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly lifecycle: OnboardingLifecycleService,
  ) {}

  async execute(id: string, dto: UpdateAssetProvisioningDto) {
    const existing = await this.prisma.assetProvisioning.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Asset provisioning not found');

    const updated = await this.prisma.assetProvisioning.update({
      where: { id },
      data: {
        equipment:
          dto.equipment === undefined ? undefined : (dto.equipment as never),
        platformPermissions:
          dto.platformPermissions === undefined
            ? undefined
            : (dto.platformPermissions as never),
        itSupervisorApprovedAt:
          dto.itSupervisorApprovedAt === undefined
            ? undefined
            : dto.itSupervisorApprovedAt
              ? new Date(dto.itSupervisorApprovedAt)
              : null,
        adminApprovedAt:
          dto.adminApprovedAt === undefined
            ? undefined
            : dto.adminApprovedAt
              ? new Date(dto.adminApprovedAt)
              : null,
        financeApprovalRequired: shouldRequireFinanceApproval({
          equipment: dto.equipment ?? (existing.equipment as never) ?? null,
          financeApprovalRequired:
            dto.financeApprovalRequired ?? existing.financeApprovalRequired,
        }),
        status: dto.status ?? undefined,
      },
    });

    if (['APPROVED', 'PROVISIONED', 'COMPLETED'].includes(updated.status)) {
      await this.lifecycle.activateEmployeeIfEligible(updated.employeeId);
    }

    return mapAssetProvisioningResponse(updated);
  }
}
