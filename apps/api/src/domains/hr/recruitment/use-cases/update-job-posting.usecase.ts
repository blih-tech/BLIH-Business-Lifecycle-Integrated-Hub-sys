import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { UpdateJobPostingDto } from '@repo/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapJobPostingResponse } from '../job-posting.mapper';

@Injectable()
export class UpdateJobPostingUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, dto: UpdateJobPostingDto) {
    const existing = await this.prisma.jobPosting.findUnique({
      where: { id },
      include: {
        position: { select: { title: true } },
        _count: { select: { candidates: true } },
      },
    });

    if (!existing) throw new NotFoundException('Job posting not found');
    if (['FILLED', 'EXPIRED', 'CANCELLED'].includes(existing.status)) {
      throw new BadRequestException('Closed job postings cannot be updated');
    }

    const updated = await this.prisma.jobPosting.update({
      where: { id },
      data: {
        positionId: dto.positionId === undefined ? undefined : dto.positionId,
        positionSnapshot:
          dto.positionSnapshot === undefined
            ? undefined
            : (dto.positionSnapshot as never),
        description:
          dto.description === undefined
            ? undefined
            : (dto.description as never),
        prerequisites:
          dto.prerequisites === undefined
            ? undefined
            : (dto.prerequisites as never),
        kpis: dto.kpis === undefined ? undefined : (dto.kpis as never),
        platforms: dto.platforms ?? undefined,
        status: dto.status ?? undefined,
        postedAt:
          dto.postedAt === undefined
            ? undefined
            : dto.postedAt
              ? new Date(dto.postedAt)
              : null,
        expiresAt:
          dto.expiresAt === undefined
            ? undefined
            : dto.expiresAt
              ? new Date(dto.expiresAt)
              : null,
        closedAt:
          dto.closedAt === undefined
            ? undefined
            : dto.closedAt
              ? new Date(dto.closedAt)
              : null,
      },
      include: {
        position: { select: { title: true } },
        _count: { select: { candidates: true } },
      },
    });

    return mapJobPostingResponse(updated);
  }
}
