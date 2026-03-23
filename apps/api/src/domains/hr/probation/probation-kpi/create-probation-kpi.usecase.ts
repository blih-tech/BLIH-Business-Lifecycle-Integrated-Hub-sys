import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import type { CreateKpiDto } from './probation-kpi.dto';

// ─── Shared helpers ────────────────────────────────────────────────────────────

/** Map a raw Prisma KPI record to the response shape. */
export function mapKpi(kpi: {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: kpi.id,
    name: kpi.name,
    description: kpi.description,
    createdAt: kpi.createdAt.toISOString(),
    updatedAt: kpi.updatedAt.toISOString(),
  };
}

// ─── Use Case ─────────────────────────────────────────────────────────────────

@Injectable()
export class CreateKpiUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateKpiDto) {
    // Note: name is set as @unique in Prisma, so we should handle potential duplicate errors
    const existing = await this.prisma.kPI.findUnique({
      where: { name: dto.name },
    });

    if (existing) {
      throw new ConflictException(
        `KPI with name '${dto.name}' already exists.`,
      );
    }

    const kpi = await this.prisma.kPI.create({
      data: {
        name: dto.name,
        description: dto.description ?? null,
      },
    });

    return mapKpi(kpi);
  }
}
