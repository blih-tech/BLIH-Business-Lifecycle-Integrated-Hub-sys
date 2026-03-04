import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import type { PipelineStatusUpdateDto } from '@repo/types';
import { assertCandidateStatusTransition } from '../candidate-status.utils';

@Injectable()
export class UpdateCandidateStatusUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, dto: PipelineStatusUpdateDto) {
    const existing = await this.prisma.candidate.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        pipeline: true,
      },
    });
    if (!existing) throw new NotFoundException('Candidate not found');

    assertCandidateStatusTransition(existing.status, dto.status);

    const pipeline =
      existing.pipeline != null &&
      typeof existing.pipeline === 'object' &&
      !Array.isArray(existing.pipeline)
        ? { ...(existing.pipeline as Record<string, unknown>) }
        : {};
    const stageHistory = Array.isArray(pipeline.stageHistory)
      ? [...pipeline.stageHistory]
      : [];
    stageHistory.push({
      status: dto.status,
      at: new Date().toISOString(),
    });

    const data: { status: unknown; pipeline?: unknown; rejection?: unknown } = {
      status: dto.status,
    };
    if (dto.pipeline !== undefined) {
      data.pipeline = {
        ...pipeline,
        ...dto.pipeline,
        stageHistory,
      };
    } else {
      data.pipeline = {
        ...pipeline,
        stageHistory,
      };
    }
    if (dto.rejection !== undefined) data.rejection = dto.rejection;

    const c = await this.prisma.candidate.update({
      where: { id },
      data: data as never,
    });

    return {
      id: c.id,
      candidateId: c.candidateId,
      status: c.status,
      pipeline: c.pipeline,
      rejection: c.rejection,
      updatedAt: c.updatedAt.toISOString(),
    };
  }
}
