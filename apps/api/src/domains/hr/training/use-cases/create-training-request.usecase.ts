import { Injectable } from '@nestjs/common';
import type { CreateTrainingRequestDto } from '@repo/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapTrainingRequestResponse } from '../training.mapper';

@Injectable()
export class CreateTrainingRequestUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateTrainingRequestDto) {
    await this.prisma.user.findUniqueOrThrow({ where: { id: dto.userId } });
    await this.prisma.department.findUniqueOrThrow({
      where: { id: dto.departmentId },
    });
    if (dto.skillGapLinkId)
      await this.prisma.skill.findUniqueOrThrow({
        where: { id: dto.skillGapLinkId },
      });
    const status = dto.submit ? 'PENDING' : 'DRAFT';
    const request = await this.prisma.trainingRequest.create({
      data: {
        userId: dto.userId,
        departmentId: dto.departmentId,
        trainingType: dto.trainingType as never,
        title: dto.title,
        provider: dto.provider ?? null,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        durationHours: dto.durationHours ?? null,
        justification: dto.justification ?? null,
        skillGapLinkId: dto.skillGapLinkId ?? null,
        cost: dto.cost ?? null,
        costPayer: dto.costPayer ?? null,
        status,
        submittedAt: dto.submit ? new Date() : null,
      },
    });
    return mapTrainingRequestResponse(request);
  }
}
