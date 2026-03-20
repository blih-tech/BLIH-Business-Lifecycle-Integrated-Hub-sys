import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import type {
  ProbationResponseDto,
  UpdateProbationDto,
} from './probation.dto';
import { mapProbation, probationInclude } from './create-probation.usecase';

async function assertKpisExist(
  prisma: PrismaService,
  kpiIds: string[],
): Promise<void> {
  if (kpiIds.length === 0) return;
  const found = await prisma.kPI.findMany({
    where: { id: { in: kpiIds } },
    select: { id: true },
  });
  if (found.length !== kpiIds.length) {
    throw new BadRequestException(
      'kpis contains one or more unknown kpiId values',
    );
  }
}

@Injectable()
export class UpdateProbationUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    id: string,
    dto: UpdateProbationDto,
  ): Promise<ProbationResponseDto> {
    const existing = await this.prisma.probationPlan.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException(`Probation plan with id "${id}" not found`);
    }

    if (dto.kpis) {
      const kpiIds = dto.kpis.map((k) => k.kpiId);
      const uniqueKpiIds = Array.from(new Set(kpiIds));
      if (uniqueKpiIds.length !== kpiIds.length) {
        throw new BadRequestException('kpis contains duplicate kpiId values');
      }
      await assertKpisExist(this.prisma, uniqueKpiIds);
    }

    const plan = await this.prisma.$transaction(async (tx) => {
      // Update scalar fields
      await tx.probationPlan.update({
        where: { id },
        data: {
          ...(dto.startDate !== undefined && {
            startDate: new Date(dto.startDate),
          }),
          ...(dto.endDate !== undefined && {
            endDate: new Date(dto.endDate),
          }),
          ...(dto.status !== undefined && { status: dto.status }),
        },
      });

      // Sync KPIs if provided
      if (dto.kpis !== undefined) {
        const incomingKpiIds = dto.kpis.map((k) => k.kpiId);

        await tx.probationKPI.deleteMany({
          where: {
            probationId: id,
            kpiId: { notIn: incomingKpiIds },
          },
        });

        await Promise.all(
          dto.kpis.map((k) =>
            tx.probationKPI.upsert({
              where: {
                probationId_kpiId: { probationId: id, kpiId: k.kpiId },
              },
              update: {},
              create: { probationId: id, kpiId: k.kpiId },
            }),
          ),
        );
      }

      // Sync checkpoints if provided
      if (dto.checkpoints !== undefined) {
        const checkpoints = dto.checkpoints;
        if (checkpoints.length === 0) {
          await tx.probationCheckpoint.deleteMany({
            where: { probationId: id },
          });
        } else {
          // Remove all and recreate (checkpoints don't have a natural unique key to upsert on)
          await tx.probationCheckpoint.deleteMany({
            where: { probationId: id },
          });
          await tx.probationCheckpoint.createMany({
            data: checkpoints.map((c) => ({
              probationId: id,
              name: c.name,
              checkpointDate: new Date(c.checkpointDate),
            })),
          });
        }
      }

      return tx.probationPlan.findUnique({
        where: { id },
        include: probationInclude,
      });
    });

    if (!plan) {
      throw new NotFoundException(`Probation plan with id "${id}" not found`);
    }

    return mapProbation(plan);
  }
}
