import { Injectable, NotFoundException } from '@nestjs/common';
import type { UpdateAssetReturnDto } from '@repo/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapAssetReturn } from '../offboarding.mapper';

@Injectable()
export class UpdateAssetReturnUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, dto: UpdateAssetReturnDto) {
    const existing = await this.prisma.assetReturn.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Asset return not found');
    const data: Record<string, unknown> = {};
    if (dto.itSignOffAt === true) data.itSignOffAt = new Date();
    if (dto.adminSignOffAt === true) data.adminSignOffAt = new Date();
    if (dto.financeSignOffAt === true) data.financeSignOffAt = new Date();
    if (dto.status !== undefined) data.status = dto.status;
    const updated = await this.prisma.assetReturn.update({
      where: { id },
      data: data as never,
    });
    return mapAssetReturn(updated);
  }
}
