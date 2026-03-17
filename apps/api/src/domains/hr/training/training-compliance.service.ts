import { Injectable } from '@nestjs/common';
import type {
  GenerateTrainingComplianceReportDto,
  TrainingComplianceAuditEntryDto,
  TrainingComplianceReportResponseDto,
  TrainingComplianceRequirementResponseDto,
  TrainingComplianceStatusResponseDto,
} from '@repo/types';
import { PrismaService } from '../../../platform/prisma/prisma.service';

function isCompletionCompliant(
  completion: {
    completionStatus: string;
    expiryDate: Date | null;
  } | null,
) {
  if (!completion || completion.completionStatus !== 'COMPLETED') {
    return false;
  }
  if (!completion.expiryDate) {
    return true;
  }
  return completion.expiryDate.getTime() >= Date.now();
}

function mapRequirement(row: {
  id: string;
  employeeId: string;
  departmentId: string;
  title: string;
  status: string;
  startDate: Date | null;
  endDate: Date | null;
  approvedAt: Date | null;
  completions: Array<{
    id: string;
    completionStatus: string;
    expiryDate: Date | null;
  }>;
}): TrainingComplianceRequirementResponseDto {
  const latestCompletion =
    [...row.completions].sort((left, right) => {
      const leftDate = left.expiryDate?.getTime() ?? 0;
      const rightDate = right.expiryDate?.getTime() ?? 0;
      return rightDate - leftDate;
    })[0] ?? null;

  return {
    trainingRequestId: row.id,
    employeeId: row.employeeId,
    departmentId: row.departmentId,
    title: row.title,
    status: row.status,
    startDate: row.startDate?.toISOString().slice(0, 10) ?? null,
    endDate: row.endDate?.toISOString().slice(0, 10) ?? null,
    approvedAt: row.approvedAt?.toISOString() ?? null,
    completionId: latestCompletion?.id ?? null,
    completionStatus: latestCompletion?.completionStatus ?? null,
    expiryDate:
      latestCompletion?.expiryDate?.toISOString().slice(0, 10) ?? null,
    isCompliant: isCompletionCompliant(latestCompletion),
  };
}

@Injectable()
export class TrainingComplianceService {
  constructor(private readonly prisma: PrismaService) {}

  async listRequirements(filters: {
    employeeId?: string;
    departmentId?: string;
    status?: string;
  }) {
    const rows = await this.prisma.trainingRequest.findMany({
      where: {
        trainingType: 'COMPLIANCE',
        ...(filters.employeeId ? { employeeId: filters.employeeId } : {}),
        ...(filters.departmentId ? { departmentId: filters.departmentId } : {}),
        ...(filters.status ? { status: filters.status as never } : {}),
      },
      include: {
        completions: {
          select: {
            id: true,
            completionStatus: true,
            expiryDate: true,
          },
        },
      },
      orderBy: [{ createdAt: 'desc' }],
    });

    return rows.map(mapRequirement);
  }

  async getStatus(filters: {
    employeeId?: string;
    departmentId?: string;
  }): Promise<TrainingComplianceStatusResponseDto> {
    const requirements = await this.listRequirements(filters);
    const expiringSoonCount = requirements.filter((requirement) => {
      if (!requirement.expiryDate) {
        return false;
      }
      const diffDays = Math.ceil(
        (new Date(requirement.expiryDate).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24),
      );
      return diffDays >= 0 && diffDays <= 30;
    }).length;

    const compliantCount = requirements.filter(
      (requirement) => requirement.isCompliant,
    ).length;
    const overdueCount = requirements.length - compliantCount;

    return {
      ...(filters.employeeId ? { employeeId: filters.employeeId } : {}),
      ...(filters.departmentId ? { departmentId: filters.departmentId } : {}),
      totalRequirements: requirements.length,
      compliantCount,
      overdueCount,
      expiringSoonCount,
      complianceRate:
        requirements.length === 0
          ? 0
          : Math.round((compliantCount / requirements.length) * 10000) / 100,
    };
  }

  async getAuditTrail(filters: {
    employeeId?: string;
    departmentId?: string;
    from?: string;
    to?: string;
  }): Promise<TrainingComplianceAuditEntryDto[]> {
    const fromDate = filters.from ? new Date(filters.from) : undefined;
    const toDate = filters.to ? new Date(filters.to) : undefined;

    const requests = await this.prisma.trainingRequest.findMany({
      where: {
        trainingType: 'COMPLIANCE',
        ...(filters.employeeId ? { employeeId: filters.employeeId } : {}),
        ...(filters.departmentId ? { departmentId: filters.departmentId } : {}),
        ...(fromDate || toDate
          ? {
              createdAt: {
                ...(fromDate ? { gte: fromDate } : {}),
                ...(toDate ? { lte: toDate } : {}),
              },
            }
          : {}),
      },
      include: {
        completions: {
          select: {
            id: true,
            createdAt: true,
          },
        },
      },
      orderBy: [{ createdAt: 'desc' }],
    });

    const audit: TrainingComplianceAuditEntryDto[] = [];
    for (const request of requests) {
      audit.push({
        trainingRequestId: request.id,
        employeeId: request.employeeId,
        action: 'REQUEST_CREATED',
        occurredAt: request.createdAt.toISOString(),
        title: request.title,
        actorId: null,
      });
      if (request.approvedAt) {
        audit.push({
          trainingRequestId: request.id,
          employeeId: request.employeeId,
          action: 'REQUEST_APPROVED',
          occurredAt: request.approvedAt.toISOString(),
          title: request.title,
          actorId: request.approvedById,
        });
      }
      for (const completion of request.completions) {
        audit.push({
          trainingRequestId: request.id,
          employeeId: request.employeeId,
          action: 'COMPLETION_RECORDED',
          occurredAt: completion.createdAt.toISOString(),
          title: request.title,
          actorId: null,
        });
      }
    }

    return audit.sort((left, right) =>
      right.occurredAt.localeCompare(left.occurredAt),
    );
  }

  async generateReport(
    dto: GenerateTrainingComplianceReportDto,
  ): Promise<TrainingComplianceReportResponseDto> {
    const requirements = await this.listRequirements({
      employeeId: dto.employeeId,
      departmentId: dto.departmentId,
    });
    const filtered = requirements.filter((requirement) => {
      if (!requirement.approvedAt) {
        return true;
      }
      return new Date(requirement.approvedAt).getUTCFullYear() === dto.year;
    });

    const completedCount = filtered.filter(
      (requirement) => requirement.isCompliant,
    ).length;
    const expiredCount = filtered.filter(
      (requirement) =>
        requirement.expiryDate != null &&
        new Date(requirement.expiryDate).getTime() < Date.now(),
    ).length;

    return {
      year: dto.year,
      ...(dto.employeeId ? { employeeId: dto.employeeId } : {}),
      ...(dto.departmentId ? { departmentId: dto.departmentId } : {}),
      totalRequirements: filtered.length,
      completedCount,
      activeCount: filtered.length - expiredCount,
      expiredCount,
      complianceRate:
        filtered.length === 0
          ? 0
          : Math.round((completedCount / filtered.length) * 10000) / 100,
    };
  }

  async listExpiringRequirements(filters: {
    employeeId?: string;
    departmentId?: string;
    days?: number;
  }) {
    const requirements = await this.listRequirements(filters);
    const days = filters.days ?? 30;
    return requirements.filter((requirement) => {
      if (!requirement.expiryDate) {
        return false;
      }
      const diffDays = Math.ceil(
        (new Date(requirement.expiryDate).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24),
      );
      return diffDays >= 0 && diffDays <= days;
    });
  }
}
