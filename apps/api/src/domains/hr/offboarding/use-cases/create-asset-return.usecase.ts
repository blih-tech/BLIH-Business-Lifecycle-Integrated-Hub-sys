import { Injectable } from '@nestjs/common';
import type { CreateAssetReturnDto } from '@repo/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapAssetReturn } from '../offboarding.mapper';

@Injectable()
export class CreateAssetReturnUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateAssetReturnDto) {
    await this.prisma.user.findUniqueOrThrow({ where: { id: dto.userId } });
    await this.prisma.offboardingChecklist.findUniqueOrThrow({
      where: { id: dto.checklistId },
    });
    const ar = await this.prisma.assetReturn.create({
      data: {
        userId: dto.userId,
        checklistId: dto.checklistId,
        items: (dto.items ?? null) as never,
        depositReturn: dto.depositReturn ?? null,
        damageDeductions: dto.damageDeductions ?? null,
        netAmount: dto.netAmount ?? null,
        status: 'PENDING',
      },
    });
    return mapAssetReturn(ar);
  }
}
