import { Injectable, NotFoundException } from '@nestjs/common';
import type { UpdateTrainingCompletionDto } from '@repo/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapTrainingCompletionResponse } from '../training.mapper';
import { TrainingProfileSyncService } from '../training-profile-sync.service';

@Injectable()
export class UpdateTrainingCompletionUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trainingProfileSync: TrainingProfileSyncService,
  ) {}

  async execute(id: string, dto: UpdateTrainingCompletionDto) {
    const existing = await this.prisma.trainingCompletion.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Training completion not found');
    const data: Record<string, unknown> = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.provider !== undefined) data.provider = dto.provider;
    if (dto.endDate !== undefined)
      data.endDate = dto.endDate ? new Date(dto.endDate) : null;
    if (dto.completionStatus !== undefined)
      data.completionStatus = dto.completionStatus;
    if (dto.scoreOrGrade !== undefined) data.scoreOrGrade = dto.scoreOrGrade;
    if (dto.certificateNumber !== undefined)
      data.certificateNumber = dto.certificateNumber;
    if (dto.certificateUrl !== undefined)
      data.certificateUrl = dto.certificateUrl;
    if (dto.expiryDate !== undefined)
      data.expiryDate = dto.expiryDate ? new Date(dto.expiryDate) : null;
    if (dto.skillsAcquired !== undefined)
      data.skillsAcquired = dto.skillsAcquired;
    if (dto.attestedAt !== undefined)
      data.attestedAt = dto.attestedAt ? new Date(dto.attestedAt) : null;
    if (dto.syncedToProfile !== undefined)
      data.syncedToProfile = dto.syncedToProfile;
    const updated = await this.prisma.trainingCompletion.update({
      where: { id },
      data: data as never,
    });
    if (updated.completionStatus === 'COMPLETED') {
      const syncedSkills = (
        Array.isArray(updated.skillsAcquired) ? updated.skillsAcquired : null
      ) as UpdateTrainingCompletionDto['skillsAcquired'];
      await this.trainingProfileSync.syncCompletionSkills({
        completionId: updated.id,
        employeeId: updated.employeeId,
        skillsAcquired: syncedSkills ?? null,
        attestedAt: updated.attestedAt,
      });
    }
    const refreshed = await this.prisma.trainingCompletion.findUniqueOrThrow({
      where: { id: updated.id },
    });
    return mapTrainingCompletionResponse(refreshed);
  }
}
