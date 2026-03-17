import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  CreateTrainingNeedsAssessmentDto,
  ReviewTrainingNeedsAssessmentDto,
  UpdateTrainingNeedsAssessmentDto,
} from '@repo/types';
import { Prisma } from '../../../platform/prisma/prisma-client';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import { resolveEmployeeSubjectOrThrow } from '../employees/employee-subject.utils';
import { mapTrainingNeedsAssessment } from './training-needs.mapper';

@Injectable()
export class TrainingNeedsAssessmentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTrainingNeedsAssessmentDto) {
    const employee = await resolveEmployeeSubjectOrThrow(
      this.prisma,
      dto.employeeId,
    );
    await this.prisma.user.findUniqueOrThrow({
      where: { id: dto.assessedById },
      select: { id: true },
    });

    if (dto.basedOnReviewId) {
      const review = await this.prisma.performanceReview.findUnique({
        where: { id: dto.basedOnReviewId },
        select: { employeeId: true },
      });
      if (!review || review.employeeId !== employee.id) {
        throw new BadRequestException(
          'basedOnReviewId must belong to the target employee',
        );
      }
    }

    const assessment = await this.prisma.trainingNeedsAssessment.create({
      data: {
        employeeId: employee.id,
        basedOnReviewId: dto.basedOnReviewId ?? null,
        periodYear: dto.periodYear,
        assessedById: dto.assessedById,
        developmentAreas: dto.developmentAreas as Prisma.InputJsonValue,
        requestedTrainings: dto.requestedTrainings as Prisma.InputJsonValue,
        skillGapSummary:
          dto.skillGapSummary ??
          this.buildSkillGapSummary(
            dto.developmentAreas,
            dto.requestedTrainings,
          ),
        priority: dto.priority ?? null,
        status: dto.submit ? 'PENDING' : 'DRAFT',
        submittedAt: dto.submit ? new Date() : null,
      },
    });

    return mapTrainingNeedsAssessment(assessment);
  }

  async list(filters: {
    employeeId?: string;
    periodYear?: number;
    status?: string;
  }) {
    const employeeId = filters.employeeId
      ? (await resolveEmployeeSubjectOrThrow(this.prisma, filters.employeeId))
          .id
      : undefined;

    const rows = await this.prisma.trainingNeedsAssessment.findMany({
      where: {
        ...(employeeId ? { employeeId } : {}),
        ...(filters.periodYear != null
          ? { periodYear: filters.periodYear }
          : {}),
        ...(filters.status ? { status: filters.status as never } : {}),
      },
      orderBy: [{ periodYear: 'desc' }, { createdAt: 'desc' }],
    });

    return rows.map(mapTrainingNeedsAssessment);
  }

  async get(id: string) {
    const row = await this.prisma.trainingNeedsAssessment.findUnique({
      where: { id },
    });
    if (!row) {
      throw new NotFoundException('Training needs assessment not found');
    }
    return mapTrainingNeedsAssessment(row);
  }

  async update(id: string, dto: UpdateTrainingNeedsAssessmentDto) {
    const existing = await this.prisma.trainingNeedsAssessment.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Training needs assessment not found');
    }
    if (existing.status !== 'DRAFT') {
      throw new BadRequestException(
        'Only draft training needs assessments can be updated',
      );
    }

    if (dto.basedOnReviewId) {
      const review = await this.prisma.performanceReview.findUnique({
        where: { id: dto.basedOnReviewId },
        select: { employeeId: true },
      });
      if (!review || review.employeeId !== existing.employeeId) {
        throw new BadRequestException(
          'basedOnReviewId must belong to the assessment employee',
        );
      }
    }

    const updated = await this.prisma.trainingNeedsAssessment.update({
      where: { id },
      data: {
        ...(dto.basedOnReviewId !== undefined
          ? { basedOnReviewId: dto.basedOnReviewId }
          : {}),
        ...(dto.developmentAreas !== undefined
          ? { developmentAreas: dto.developmentAreas as Prisma.InputJsonValue }
          : {}),
        ...(dto.requestedTrainings !== undefined
          ? {
              requestedTrainings:
                dto.requestedTrainings as Prisma.InputJsonValue,
            }
          : {}),
        ...(dto.skillGapSummary !== undefined
          ? { skillGapSummary: dto.skillGapSummary }
          : {}),
        ...(dto.priority !== undefined ? { priority: dto.priority } : {}),
      },
    });

    return mapTrainingNeedsAssessment(updated);
  }

  async submit(id: string) {
    const existing = await this.prisma.trainingNeedsAssessment.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Training needs assessment not found');
    }
    if (existing.status !== 'DRAFT') {
      throw new BadRequestException(
        'Only draft training needs assessments can be submitted',
      );
    }

    const updated = await this.prisma.trainingNeedsAssessment.update({
      where: { id },
      data: {
        status: 'PENDING',
        submittedAt: existing.submittedAt ?? new Date(),
        reviewedById: null,
        reviewedAt: null,
        rejectionReason: null,
      },
    });

    return mapTrainingNeedsAssessment(updated);
  }

  async review(id: string, dto: ReviewTrainingNeedsAssessmentDto) {
    const existing = await this.prisma.trainingNeedsAssessment.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Training needs assessment not found');
    }
    if (existing.status !== 'PENDING') {
      throw new BadRequestException(
        'Only pending training needs assessments can be reviewed',
      );
    }

    await this.prisma.user.findUniqueOrThrow({
      where: { id: dto.reviewedById },
      select: { id: true },
    });

    if (!dto.approved && !dto.rejectionReason?.trim()) {
      throw new BadRequestException(
        'Rejected training needs assessments require rejectionReason',
      );
    }

    const updated = await this.prisma.trainingNeedsAssessment.update({
      where: { id },
      data: {
        status: dto.approved ? 'APPROVED' : 'REJECTED',
        reviewedById: dto.reviewedById,
        reviewedAt: new Date(),
        managerNotes: dto.managerNotes ?? null,
        rejectionReason: dto.approved
          ? null
          : (dto.rejectionReason ?? '').trim(),
      },
    });

    return mapTrainingNeedsAssessment(updated);
  }

  private buildSkillGapSummary(
    developmentAreas: CreateTrainingNeedsAssessmentDto['developmentAreas'],
    requestedTrainings: CreateTrainingNeedsAssessmentDto['requestedTrainings'],
  ) {
    const focusAreas = developmentAreas
      .filter((item) => item.priority === 'HIGH')
      .map((item) => item.area.trim());

    const trainingTitles = requestedTrainings
      .slice(0, 2)
      .map((item) => item.title.trim())
      .filter(Boolean);

    return [focusAreas.join(', '), trainingTitles.join(', ')]
      .filter(Boolean)
      .join(' | ');
  }
}
