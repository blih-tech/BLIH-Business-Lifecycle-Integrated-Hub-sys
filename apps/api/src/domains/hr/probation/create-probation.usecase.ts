import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import type {
  CreateProbationDto,
  ProbationResponseDto,
  ProbationStatusValue,
} from './probation.dto';

// ─── Shared helpers ────────────────────────────────────────────────────────────

const toDateOnly = (value: Date | null | undefined) =>
  value ? value.toISOString().slice(0, 10) : null;

async function assertEmployeeExists(
  prisma: PrismaService,
  employeeId: string,
): Promise<void> {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { id: true },
  });
  if (!employee) {
    throw new BadRequestException(
      'employeeId does not reference an existing employee',
    );
  }
}

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

/** Standard Prisma include for ProbationPlan queries. */
export const probationInclude = {
  kpis: {
    select: {
      id: true,
      kpiId: true,
      createdAt: true,
      kpi: { select: { name: true } },
    },
    orderBy: { createdAt: 'asc' as const },
  },
  checkpoints: {
    select: {
      id: true,
      name: true,
      checkpointDate: true,
      createdAt: true,
    },
    orderBy: { checkpointDate: 'asc' as const },
  },
} as const;

/** Map a Prisma ProbationPlan record to the response shape. */
export function mapProbation(plan: {
  id: string;
  employeeId: string;
  startDate: Date;
  endDate: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  kpis: Array<{
    id: string;
    kpiId: string;
    createdAt: Date;
    kpi: { name: string };
  }>;
  checkpoints: Array<{
    id: string;
    name: string;
    checkpointDate: Date;
    createdAt: Date;
  }>;
}): ProbationResponseDto {
  return {
    id: plan.id,
    employeeId: plan.employeeId,
    startDate: toDateOnly(plan.startDate) ?? '',
    endDate: toDateOnly(plan.endDate) ?? '',
    status: plan.status as ProbationStatusValue,
    kpis: plan.kpis.map((k) => ({
      id: k.id,
      kpiId: k.kpiId,
      kpiName: k.kpi.name,
      createdAt: k.createdAt.toISOString(),
    })),
    checkpoints: plan.checkpoints.map((c) => ({
      id: c.id,
      name: c.name,
      checkpointDate: c.checkpointDate.toISOString(),
      createdAt: c.createdAt.toISOString(),
    })),
    createdAt: plan.createdAt.toISOString(),
    updatedAt: plan.updatedAt.toISOString(),
  };
}

// ─── Use Case ─────────────────────────────────────────────────────────────────

@Injectable()
export class CreateProbationUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateProbationDto): Promise<ProbationResponseDto> {
    await assertEmployeeExists(this.prisma, dto.employeeId);

    const kpis = dto.kpis ?? [];
    const kpiIds = kpis.map((k) => k.kpiId);
    const uniqueKpiIds = Array.from(new Set(kpiIds));
    if (uniqueKpiIds.length !== kpiIds.length) {
      throw new BadRequestException('kpis contains duplicate kpiId values');
    }
    await assertKpisExist(this.prisma, uniqueKpiIds);

    const checkpoints = dto.checkpoints ?? [];

    const plan = await this.prisma.probationPlan.create({
      data: {
        employeeId: dto.employeeId,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        status: dto.status ?? undefined,
        ...(kpis.length > 0 && {
          kpis: {
            create: kpis.map((k) => ({ kpiId: k.kpiId })),
          },
        }),
        ...(checkpoints.length > 0 && {
          checkpoints: {
            create: checkpoints.map((c) => ({
              name: c.name,
              checkpointDate: new Date(c.checkpointDate),
            })),
          },
        }),
      },
      include: probationInclude,
    });

    return mapProbation(plan);
  }
}
