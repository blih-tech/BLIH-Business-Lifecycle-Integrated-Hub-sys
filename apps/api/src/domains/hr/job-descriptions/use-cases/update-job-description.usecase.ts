import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../../../platform/prisma/prisma-client';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import type { UpdateJobDescriptionDto } from '@blih/types';

@Injectable()
export class UpdateJobDescriptionUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, dto: UpdateJobDescriptionDto) {
    const existing = await this.prisma.jobDescription.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Job description not found');

    if (dto.positionId) {
      const position = await this.prisma.position.findUnique({
        where: { id: dto.positionId },
        select: { id: true },
      });
      if (!position) throw new NotFoundException('Position not found');
    }

    const data: Record<string, unknown> = {};
    if (dto.positionId !== undefined) data.positionId = dto.positionId;
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.level !== undefined) data.level = dto.level;
    if (dto.code !== undefined) data.code = dto.code;
    if (dto.summary !== undefined) data.summary = dto.summary;
    if (dto.duties !== undefined) data.duties = dto.duties;
    if (dto.skills !== undefined) data.skills = dto.skills;
    if (dto.kpis !== undefined) data.kpis = dto.kpis;
    if (dto.documentUrl !== undefined) data.documentUrl = dto.documentUrl;
    if (dto.version !== undefined) data.version = dto.version;
    if (dto.effectiveFrom !== undefined)
      data.effectiveFrom = dto.effectiveFrom
        ? new Date(dto.effectiveFrom)
        : null;

    const jd = await this.prisma.jobDescription.update({
      where: { id },
      data: data as Prisma.JobDescriptionUncheckedUpdateInput,
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

    const withPosition = jd as typeof jd & {
      position: {
        id: string;
        title: string;
        departmentId: string;
        department: { name: string } | null;
      } | null;
    };
    return {
      id: withPosition.id,
      departmentId: withPosition.position?.departmentId ?? null,
      departmentName: withPosition.position?.department?.name ?? null,
      positionId: withPosition.positionId ?? null,
      positionTitle: withPosition.position?.title ?? null,
      title: withPosition.title,
      level: withPosition.level ?? null,
      code: withPosition.code ?? null,
      summary: withPosition.summary ?? null,
      duties: withPosition.duties,
      skills: withPosition.skills,
      kpis: withPosition.kpis,
      documentUrl: withPosition.documentUrl ?? null,
      version: withPosition.version,
      effectiveFrom:
        withPosition.effectiveFrom?.toISOString().slice(0, 10) ?? null,
      createdAt: withPosition.createdAt.toISOString(),
      updatedAt: withPosition.updatedAt.toISOString(),
    };
  }
}
