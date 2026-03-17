import { Injectable } from '@nestjs/common';
import type { CreateTrainingCompletionDto } from '@repo/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapTrainingCompletionResponse } from '../training.mapper';
import { resolveEmployeeSubjectOrThrow } from '../../employees/employee-subject.utils';
import { TrainingProfileSyncService } from '../training-profile-sync.service';

@Injectable()
export class CreateTrainingCompletionUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trainingProfileSync: TrainingProfileSyncService,
  ) {}

  async execute(dto: CreateTrainingCompletionDto) {
    const employee = await resolveEmployeeSubjectOrThrow(
      this.prisma,
      dto.employeeId,
    );
    const c = await this.prisma.trainingCompletion.create({
      data: {
        employeeId: employee.id,
        trainingRequestId: dto.trainingRequestId ?? null,
        title: dto.title,
        provider: dto.provider ?? null,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        completionStatus: dto.completionStatus as never,
        scoreOrGrade: dto.scoreOrGrade ?? null,
        certificateNumber: dto.certificateNumber ?? null,
        certificateUrl: dto.certificateUrl ?? null,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
        skillsAcquired: (dto.skillsAcquired ?? null) as never,
        attestedAt: dto.attestedAt ? new Date(dto.attestedAt) : new Date(),
      },
    });
    if (c.completionStatus === 'COMPLETED') {
      const syncedSkills = (
        Array.isArray(c.skillsAcquired) ? c.skillsAcquired : null
      ) as CreateTrainingCompletionDto['skillsAcquired'];
      await this.trainingProfileSync.syncCompletionSkills({
        completionId: c.id,
        employeeId: employee.id,
        skillsAcquired: syncedSkills ?? null,
        attestedAt: c.attestedAt,
      });
    }
    const refreshed = await this.prisma.trainingCompletion.findUniqueOrThrow({
      where: { id: c.id },
    });
    return mapTrainingCompletionResponse(refreshed);
  }
}
