import { Injectable } from '@nestjs/common';
import type { CreateTrainingCompletionDto } from '@repo/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapTrainingCompletionResponse } from '../training.mapper';

@Injectable()
export class CreateTrainingCompletionUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateTrainingCompletionDto) {
    await this.prisma.user.findUniqueOrThrow({ where: { id: dto.userId } });
    const c = await this.prisma.trainingCompletion.create({
      data: {
        userId: dto.userId,
        trainingRequestId: dto.trainingRequestId ?? null,
        title: dto.title,
        provider: dto.provider ?? null,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        completionStatus: dto.completionStatus as never,
        scoreOrGrade: dto.scoreOrGrade ?? null,
        certificateNumber: dto.certificateNumber ?? null,
        certificateUrl: dto.certificateUrl ?? null,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
        skillsAcquired: (dto.skillsAcquired ?? null) as never,
        attestedAt: dto.attestedAt ? new Date(dto.attestedAt) : new Date(),
      },
    });
    return mapTrainingCompletionResponse(c);
  }
}
