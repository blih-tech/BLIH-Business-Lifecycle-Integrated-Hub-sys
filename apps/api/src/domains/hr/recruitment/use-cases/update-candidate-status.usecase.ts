import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import type { PipelineStatusUpdateDto } from '@blih/types';

@Injectable()
export class UpdateCandidateStatusUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, dto: PipelineStatusUpdateDto) {
    const existing = await this.prisma.candidate.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Candidate not found');

    const data: { status: unknown; pipeline?: unknown; rejection?: unknown } = {
      status: dto.status,
    };
    if (dto.pipeline !== undefined) data.pipeline = dto.pipeline;
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
