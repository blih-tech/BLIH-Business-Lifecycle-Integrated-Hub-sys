import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  CertificationResponseDto,
  CreateCertificationDto,
  RenewCertificationDto,
  UpdateCertificationDto,
} from '@repo/types';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import { resolveEmployeeSubjectOrThrow } from '../employees/employee-subject.utils';
import { TrainingProfileSyncService } from './training-profile-sync.service';

function mapCertificationStatus(expiryDate: Date | null) {
  if (!expiryDate) {
    return { status: 'NO_EXPIRY' as const, daysUntilExpiry: null };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil(
    (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays < 0) {
    return { status: 'EXPIRED' as const, daysUntilExpiry: diffDays };
  }
  if (diffDays <= 30) {
    return { status: 'EXPIRING_SOON' as const, daysUntilExpiry: diffDays };
  }
  return { status: 'ACTIVE' as const, daysUntilExpiry: diffDays };
}

function mapCertification(row: {
  id: string;
  employeeId: string;
  trainingRequestId: string | null;
  title: string;
  provider: string | null;
  completionStatus: string;
  certificateNumber: string | null;
  certificateUrl: string | null;
  endDate: Date | null;
  expiryDate: Date | null;
  scoreOrGrade: string | null;
  skillsAcquired: unknown;
  syncedToProfile: boolean;
  createdAt: Date;
  updatedAt: Date;
}): CertificationResponseDto {
  const { status, daysUntilExpiry } = mapCertificationStatus(row.expiryDate);
  return {
    id: row.id,
    employeeId: row.employeeId,
    trainingRequestId: row.trainingRequestId,
    title: row.title,
    provider: row.provider,
    completionStatus:
      row.completionStatus as CertificationResponseDto['completionStatus'],
    certificateNumber: row.certificateNumber,
    certificateUrl: row.certificateUrl,
    issuedAt: row.endDate?.toISOString().slice(0, 10) ?? null,
    expiryDate: row.expiryDate?.toISOString().slice(0, 10) ?? null,
    scoreOrGrade: row.scoreOrGrade,
    status,
    daysUntilExpiry,
    skillsAcquired: Array.isArray(row.skillsAcquired)
      ? row.skillsAcquired
      : null,
    syncedToProfile: row.syncedToProfile,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

@Injectable()
export class TrainingCertificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trainingProfileSync: TrainingProfileSyncService,
  ) {}

  async list(filters: {
    employeeId?: string;
    status?: string;
    expiringWithinDays?: number;
  }) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiryUpperBound =
      filters.expiringWithinDays != null
        ? new Date(
            today.getTime() + filters.expiringWithinDays * 24 * 60 * 60 * 1000,
          )
        : null;

    const rows = await this.prisma.trainingCompletion.findMany({
      where: {
        ...(filters.employeeId ? { employeeId: filters.employeeId } : {}),
        OR: [
          { certificateNumber: { not: null } },
          { certificateUrl: { not: null } },
          { expiryDate: { not: null } },
        ],
        ...(expiryUpperBound
          ? { expiryDate: { not: null, gte: today, lte: expiryUpperBound } }
          : {}),
      },
      orderBy: [{ expiryDate: 'asc' }, { createdAt: 'desc' }],
    });

    return rows
      .map(mapCertification)
      .filter((row) => !filters.status || row.status === filters.status);
  }

  async get(id: string) {
    const row = await this.prisma.trainingCompletion.findUnique({
      where: { id },
    });
    if (
      !row ||
      (!row.certificateNumber && !row.certificateUrl && !row.expiryDate)
    ) {
      throw new NotFoundException('Certification not found');
    }
    return mapCertification(row);
  }

  async create(dto: CreateCertificationDto) {
    const employee = await resolveEmployeeSubjectOrThrow(
      this.prisma,
      dto.employeeId,
    );

    const row = await this.prisma.trainingCompletion.create({
      data: {
        employeeId: employee.id,
        trainingRequestId: dto.trainingRequestId ?? null,
        title: dto.title.trim(),
        provider: dto.provider ?? null,
        endDate: dto.issuedAt ? new Date(dto.issuedAt) : null,
        completionStatus: 'COMPLETED',
        scoreOrGrade: dto.scoreOrGrade ?? null,
        certificateNumber: dto.certificateNumber ?? null,
        certificateUrl: dto.certificateUrl ?? null,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
        skillsAcquired: (dto.skillsAcquired ?? null) as never,
        attestedAt: dto.attestedAt ? new Date(dto.attestedAt) : new Date(),
      },
    });

    await this.trainingProfileSync.syncCompletionSkills({
      completionId: row.id,
      employeeId: row.employeeId,
      skillsAcquired: dto.skillsAcquired ?? null,
      attestedAt: row.attestedAt,
    });

    const refreshed = await this.prisma.trainingCompletion.findUniqueOrThrow({
      where: { id: row.id },
    });
    return mapCertification(refreshed);
  }

  async update(id: string, dto: UpdateCertificationDto) {
    const existing = await this.prisma.trainingCompletion.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Certification not found');
    }

    const updated = await this.prisma.trainingCompletion.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
        ...(dto.provider !== undefined ? { provider: dto.provider } : {}),
        ...(dto.issuedAt !== undefined
          ? { endDate: dto.issuedAt ? new Date(dto.issuedAt) : null }
          : {}),
        ...(dto.scoreOrGrade !== undefined
          ? { scoreOrGrade: dto.scoreOrGrade }
          : {}),
        ...(dto.certificateNumber !== undefined
          ? { certificateNumber: dto.certificateNumber }
          : {}),
        ...(dto.certificateUrl !== undefined
          ? { certificateUrl: dto.certificateUrl }
          : {}),
        ...(dto.expiryDate !== undefined
          ? { expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null }
          : {}),
        ...(dto.skillsAcquired !== undefined
          ? { skillsAcquired: dto.skillsAcquired as never }
          : {}),
        ...(dto.syncedToProfile !== undefined
          ? { syncedToProfile: dto.syncedToProfile }
          : {}),
      },
    });

    if (updated.completionStatus === 'COMPLETED') {
      const syncSkills = (dto.skillsAcquired ??
        (Array.isArray(updated.skillsAcquired)
          ? updated.skillsAcquired
          : null)) as CreateCertificationDto['skillsAcquired'];
      await this.trainingProfileSync.syncCompletionSkills({
        completionId: updated.id,
        employeeId: updated.employeeId,
        skillsAcquired: syncSkills ?? null,
        attestedAt: updated.attestedAt,
      });
    }

    const refreshed = await this.prisma.trainingCompletion.findUniqueOrThrow({
      where: { id: updated.id },
    });
    return mapCertification(refreshed);
  }

  async renew(id: string, dto: RenewCertificationDto) {
    const existing = await this.prisma.trainingCompletion.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Certification not found');
    }

    const updated = await this.prisma.trainingCompletion.update({
      where: { id },
      data: {
        completionStatus: 'COMPLETED',
        endDate: dto.renewalDate ? new Date(dto.renewalDate) : existing.endDate,
        attestedAt: dto.renewalDate ? new Date(dto.renewalDate) : new Date(),
        expiryDate: new Date(dto.expiryDate),
        ...(dto.certificateNumber !== undefined
          ? { certificateNumber: dto.certificateNumber }
          : {}),
        ...(dto.certificateUrl !== undefined
          ? { certificateUrl: dto.certificateUrl }
          : {}),
        ...(dto.scoreOrGrade !== undefined
          ? { scoreOrGrade: dto.scoreOrGrade }
          : {}),
        ...(dto.skillsAcquired !== undefined
          ? { skillsAcquired: dto.skillsAcquired as never }
          : {}),
      },
    });

    const syncSkills = (dto.skillsAcquired ??
      (Array.isArray(updated.skillsAcquired)
        ? updated.skillsAcquired
        : null)) as CreateCertificationDto['skillsAcquired'];
    await this.trainingProfileSync.syncCompletionSkills({
      completionId: updated.id,
      employeeId: updated.employeeId,
      skillsAcquired: syncSkills ?? null,
      attestedAt: updated.attestedAt,
    });

    const refreshed = await this.prisma.trainingCompletion.findUniqueOrThrow({
      where: { id: updated.id },
    });
    return mapCertification(refreshed);
  }
}
