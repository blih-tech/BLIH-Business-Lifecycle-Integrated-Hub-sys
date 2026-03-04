import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';

@Injectable()
export class GetJobDescriptionUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string) {
    const jd = await this.prisma.jobDescription.findUnique({
      where: { id },
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
    if (!jd) throw new NotFoundException('Job description not found');
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
