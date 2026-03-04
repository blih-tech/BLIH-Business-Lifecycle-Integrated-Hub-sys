import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapAssetProvisioningResponse } from '../asset-provisioning.mapper';

@Injectable()
export class GetAssetProvisioningUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string) {
    const provisioning = await this.prisma.assetProvisioning.findUnique({
      where: { id },
    });
    if (!provisioning)
      throw new NotFoundException('Asset provisioning not found');
    return mapAssetProvisioningResponse(provisioning);
  }
}
