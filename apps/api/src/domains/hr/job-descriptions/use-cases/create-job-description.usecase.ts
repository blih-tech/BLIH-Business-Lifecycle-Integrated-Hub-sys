import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import type { CreateJobDescriptionDto } from '@repo/types';

@Injectable()
export class CreateJobDescriptionUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateJobDescriptionDto) {
    if (dto.positionId) {
      const position = await this.prisma.position.findUnique({
        where: { id: dto.positionId },
        select: { id: true },
      });
      if (!position) {
        throw new NotFoundException('Position not found');
      }
    }

    const jd = await this.prisma.jobDescription.create({
      data: {
        positionId: dto.positionId ?? undefined,
        title: dto.title,
        level: dto.level ?? undefined,
        code: dto.code ?? undefined,
        summary: dto.summary ?? undefined,
        duties: dto.duties ?? undefined,
        skills: dto.skills ?? undefined,
        kpis: dto.kpis ?? undefined,
        documentUrl: dto.documentUrl ?? undefined,
        version: dto.version ?? 1,
        effectiveFrom: dto.effectiveFrom
          ? new Date(dto.effectiveFrom)
          : undefined,
      },
      include: {
        position: {
          select: {
            id: true,
            title: true,
            departmentId: true,
            department: { select: { name: true } },
          },
        },
      },
    });

    return {
      id: jd.id,
      departmentId: jd.position?.departmentId ?? null,
      departmentName: jd.position?.department?.name ?? null,
      positionId: jd.positionId ?? null,
      positionTitle: jd.position?.title ?? null,
      title: jd.title,
      level: jd.level ?? null,
      code: jd.code ?? null,
      summary: jd.summary ?? null,
      duties: jd.duties,
      skills: jd.skills,
      kpis: jd.kpis,
      documentUrl: jd.documentUrl ?? null,
      version: jd.version,
      effectiveFrom: jd.effectiveFrom?.toISOString().slice(0, 10) ?? null,
      createdAt: jd.createdAt.toISOString(),
      updatedAt: jd.updatedAt.toISOString(),
    };
  }
}
