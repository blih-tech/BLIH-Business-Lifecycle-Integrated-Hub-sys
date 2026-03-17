import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '../../../../platform/prisma/prisma-client';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import type {
  AssetProvisioningResponseDto,
  UpdateAssetProvisioningDto,
} from './asset-provisioning.dto';
import { mapAssetProvisioning } from './create-asset-provisioning.usecase';

@Injectable()
export class UpdateAssetProvisioningUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    id: string,
    dto: UpdateAssetProvisioningDto,
  ): Promise<AssetProvisioningResponseDto> {
    const existing = await this.prisma.assetProvisioning.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException(
        `Asset provisioning with id "${id}" not found`,
      );
    }

    const record = await this.prisma.assetProvisioning.update({
      where: { id },
      data: {
        ...(dto.equipment !== undefined && {
          equipment: dto.equipment as unknown as Prisma.InputJsonValue,
        }),
        ...(dto.platformPermissions !== undefined && {
          platformPermissions:
            dto.platformPermissions as unknown as Prisma.InputJsonValue,
        }),
        ...(dto.financeApprovalRequired !== undefined && {
          financeApprovalRequired: dto.financeApprovalRequired,
        }),
        ...(dto.itSupervisorApprovedAt !== undefined && {
          itSupervisorApprovedAt: dto.itSupervisorApprovedAt
            ? new Date(dto.itSupervisorApprovedAt)
            : null,
        }),
        ...(dto.adminApprovedAt !== undefined && {
          adminApprovedAt: dto.adminApprovedAt
            ? new Date(dto.adminApprovedAt)
            : null,
        }),
        ...(dto.status !== undefined && { status: dto.status }),
      },
    });

    return mapAssetProvisioning(record);
  }
}
