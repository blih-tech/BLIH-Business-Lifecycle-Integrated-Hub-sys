import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { ApproveTrainingRequestDto } from '@repo/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapTrainingRequestResponse } from '../training.mapper';

@Injectable()
export class ApproveTrainingRequestUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    requestId: string,
    approverId: string,
    dto: ApproveTrainingRequestDto,
  ) {
    const req = await this.prisma.trainingRequest.findUnique({
      where: { id: requestId },
    });
    if (!req) throw new NotFoundException('Training request not found');
    if (req.status !== 'PENDING')
      throw new BadRequestException(
        'Only PENDING requests can be approved or rejected',
      );
    const cost = req.cost != null ? Number(req.cost) : 0;
    if (dto.approved && cost > 0 && req.costPayer === 'COMPANY') {
      const y = new Date().getFullYear();
      const bud = await this.prisma.trainingBudget.findUnique({
        where: {
          departmentId_year: { departmentId: req.departmentId, year: y },
        },
      });
      if (bud && Number(bud.usedYtd) + cost > Number(bud.totalBudget))
        throw new BadRequestException('Training budget exceeded');
      if (bud)
        await this.prisma.trainingBudget.update({
          where: { id: bud.id },
          data: { usedYtd: Number(bud.usedYtd) + cost },
        });
    }
    const updated = await this.prisma.trainingRequest.update({
      where: { id: requestId },
      data: {
        status: dto.approved ? 'APPROVED' : 'REJECTED',
        approvedById: approverId,
        approvedAt: new Date(),
        rejectionReason: dto.approved ? null : (dto.rejectionReason ?? null),
      },
    });
    return mapTrainingRequestResponse(updated);
  }
}
