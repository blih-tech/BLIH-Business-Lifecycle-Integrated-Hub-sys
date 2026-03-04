import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapAssetProvisioningResponse } from '../asset-provisioning.mapper';

@Injectable()
export class ListAssetProvisioningUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(filters: { employeeId?: string; status?: string }) {
    const list = await this.prisma.assetProvisioning.findMany({
      where: {
        ...(filters.employeeId ? { employeeId: filters.employeeId } : {}),
        ...(filters.status ? { status: filters.status as never } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    return list.map(mapAssetProvisioningResponse);
  }
}
