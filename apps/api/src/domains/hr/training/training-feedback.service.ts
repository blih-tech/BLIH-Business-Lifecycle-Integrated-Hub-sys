import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  CreateFeedbackTemplateDto,
  CreateTrainingFeedbackDto,
  FeedbackResponseItemDto,
  TrainingFeedbackResponseDto,
  TrainingFeedbackTemplateResponseDto,
} from '@repo/types';
import { Prisma } from '../../../platform/prisma/prisma-client';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import { resolveEmployeeSubjectOrThrow } from '../employees/employee-subject.utils';

function dec(value: unknown): number | null {
  if (value == null) {
    return null;
  }
  if (typeof value === 'object' && value !== null && 'toNumber' in value) {
    return (value as { toNumber(): number }).toNumber();
  }
  return Number(value);
}

function mapTemplate(row: {
  id: string;
  name: string;
  description: string | null;
  feedbackType: string;
  ratingScale: string;
  questions: unknown;
  isActive: boolean;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}): TrainingFeedbackTemplateResponseDto {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    feedbackType:
      row.feedbackType as TrainingFeedbackTemplateResponseDto['feedbackType'],
    ratingScale:
      row.ratingScale as TrainingFeedbackTemplateResponseDto['ratingScale'],
    questions: Array.isArray(row.questions) ? row.questions : [],
    isActive: row.isActive,
    createdById: row.createdById,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapFeedback(row: {
  id: string;
  trainingCompletionId: string;
  templateId: string;
  participantId: string;
  submissionType: string;
  status: string;
  responses: unknown;
  overallRating: unknown;
  comments: string | null;
  submittedAt: Date | null;
  reviewedById: string | null;
  reviewedAt: Date | null;
  actionTaken: string | null;
  createdAt: Date;
  updatedAt: Date;
  template: {
    id: string;
    name: string;
    description: string | null;
    feedbackType: string;
    ratingScale: string;
    questions: unknown;
    isActive: boolean;
    createdById: string;
    createdAt: Date;
    updatedAt: Date;
  };
}): TrainingFeedbackResponseDto {
  return {
    id: row.id,
    trainingCompletionId: row.trainingCompletionId,
    templateId: row.templateId,
    template: mapTemplate(row.template),
    participantId: row.participantId,
    submissionType:
      row.submissionType as TrainingFeedbackResponseDto['submissionType'],
    status: row.status as TrainingFeedbackResponseDto['status'],
    responses: Array.isArray(row.responses) ? row.responses : [],
    overallRating: dec(row.overallRating),
    comments: row.comments,
    submittedAt: row.submittedAt?.toISOString() ?? null,
    reviewedById: row.reviewedById,
    reviewedAt: row.reviewedAt?.toISOString() ?? null,
    actionTaken: row.actionTaken,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

@Injectable()
export class TrainingFeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  private get feedbackTemplateRepo() {
    return (this.prisma as unknown as Record<string, any>)
      .trainingFeedbackTemplate;
  }

  private get feedbackRepo() {
    return (this.prisma as unknown as Record<string, any>).trainingFeedback;
  }

  async listTemplates(filters: { feedbackType?: string; isActive?: boolean }) {
    const rows = await this.feedbackTemplateRepo.findMany({
      where: {
        ...(filters.feedbackType
          ? { feedbackType: filters.feedbackType as never }
          : {}),
        ...(typeof filters.isActive === 'boolean'
          ? { isActive: filters.isActive }
          : {}),
      },
      orderBy: [{ createdAt: 'desc' }],
    });
    return rows.map(mapTemplate);
  }

  async createTemplate(dto: CreateFeedbackTemplateDto, createdById: string) {
    await this.prisma.user.findUniqueOrThrow({
      where: { id: createdById },
      select: { id: true },
    });

    const existing = await this.feedbackTemplateRepo.findFirst({
      where: {
        name: dto.name.trim(),
        createdById,
      },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException('Template with this name already exists');
    }

    const row = await this.feedbackTemplateRepo.create({
      data: {
        name: dto.name.trim(),
        description: dto.description ?? null,
        feedbackType: dto.feedbackType as never,
        ratingScale: dto.ratingScale as never,
        questions: dto.questions as unknown as Prisma.InputJsonValue,
        isActive: dto.isActive ?? true,
        createdById,
      },
    });

    return mapTemplate(row);
  }

  async listFeedback(filters: {
    trainingCompletionId?: string;
    templateId?: string;
    participantId?: string;
    status?: string;
    submissionType?: string;
    trainingRequestId?: string;
  }) {
    const rows = await this.feedbackRepo.findMany({
      where: {
        ...(filters.templateId ? { templateId: filters.templateId } : {}),
        ...(filters.participantId
          ? { participantId: filters.participantId }
          : {}),
        ...(filters.status ? { status: filters.status as never } : {}),
        ...(filters.submissionType
          ? { submissionType: filters.submissionType as never }
          : {}),
        ...(filters.trainingCompletionId
          ? { trainingCompletionId: filters.trainingCompletionId }
          : {}),
        ...(filters.trainingRequestId
          ? {
              trainingCompletion: {
                trainingRequestId: filters.trainingRequestId,
              },
            }
          : {}),
      },
      include: {
        template: true,
      },
      orderBy: [{ createdAt: 'desc' }],
    });

    return rows.map(mapFeedback);
  }

  async getFeedback(id: string) {
    const row = await this.feedbackRepo.findUnique({
      where: { id },
      include: { template: true },
    });
    if (!row) {
      throw new NotFoundException('Training feedback not found');
    }
    return mapFeedback(row);
  }

  async createFeedback(
    dto: CreateTrainingFeedbackDto,
    participantSubjectId: string,
  ) {
    const participant = await resolveEmployeeSubjectOrThrow(
      this.prisma,
      participantSubjectId,
    );

    const completion = await this.prisma.trainingCompletion.findFirst({
      where: {
        id: dto.trainingCompletionId,
        employeeId: participant.id,
      },
      select: { id: true },
    });
    if (!completion) {
      throw new NotFoundException(
        'Training completion not found or access denied',
      );
    }

    const template = await this.feedbackTemplateRepo.findFirst({
      where: {
        id: dto.templateId,
        isActive: true,
      },
    });
    if (!template) {
      throw new NotFoundException('Feedback template not found or inactive');
    }

    const existing = await this.feedbackRepo.findFirst({
      where: {
        trainingCompletionId: dto.trainingCompletionId,
        templateId: dto.templateId,
        participantId: participant.id,
      },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException(
        'Feedback already submitted for this training',
      );
    }

    this.validateResponses(
      dto.responses,
      Array.isArray(template.questions) ? template.questions : [],
      template.ratingScale,
    );

    const overallRating =
      dto.overallRating ??
      this.calculateOverallRating(
        dto.responses,
        Array.isArray(template.questions) ? template.questions : [],
      );

    const row = await this.feedbackRepo.create({
      data: {
        trainingCompletionId: dto.trainingCompletionId,
        templateId: dto.templateId,
        participantId: participant.id,
        submissionType: dto.submissionType as never,
        status: dto.submit ? 'SUBMITTED' : 'DRAFT',
        responses: dto.responses as unknown as Prisma.InputJsonValue,
        overallRating,
        comments: dto.comments ?? null,
        submittedAt: dto.submit ? new Date() : null,
      },
      include: {
        template: true,
      },
    });

    return mapFeedback(row);
  }

  private validateResponses(
    responses: FeedbackResponseItemDto[],
    questions: Array<Record<string, unknown>>,
    ratingScale: string,
  ) {
    const requiredQuestions = questions.filter(
      (question) => question.required === true,
    );
    const answeredIds = new Set(
      responses.map((response) => response.questionId),
    );

    for (const question of requiredQuestions) {
      if (!answeredIds.has(String(question.id ?? ''))) {
        throw new BadRequestException(
          `Required question ${String(question.id ?? '')} is not answered`,
        );
      }
    }

    for (const response of responses) {
      const question = questions.find(
        (candidate) => String(candidate.id ?? '') === response.questionId,
      );
      if (!question) {
        throw new BadRequestException(
          `Invalid question ID: ${response.questionId}`,
        );
      }

      const type = String(question.type ?? '');
      if (type === 'RATING') {
        const numericValue = Number(response.value);
        if (Number.isNaN(numericValue)) {
          throw new BadRequestException(
            `Invalid rating value for question ${response.questionId}`,
          );
        }
        const maxValue = ratingScale === 'ONE_TO_TEN' ? 10 : 5;
        if (numericValue < 1 || numericValue > maxValue) {
          throw new BadRequestException(
            `Rating must be between 1 and ${maxValue} for question ${response.questionId}`,
          );
        }
      }

      if (type === 'BOOLEAN' && typeof response.value !== 'boolean') {
        throw new BadRequestException(
          `Boolean value expected for question ${response.questionId}`,
        );
      }

      if (type === 'TEXT' && typeof response.value !== 'string') {
        throw new BadRequestException(
          `Text value expected for question ${response.questionId}`,
        );
      }

      if (type === 'MULTIPLE_CHOICE') {
        const options = Array.isArray(question.options) ? question.options : [];
        if (!options.includes(response.value)) {
          throw new BadRequestException(
            `Invalid option for question ${response.questionId}`,
          );
        }
      }
    }
  }

  private calculateOverallRating(
    responses: FeedbackResponseItemDto[],
    questions: Array<Record<string, unknown>>,
  ) {
    const ratingQuestionIds = new Set(
      questions
        .filter((question) => String(question.type ?? '') === 'RATING')
        .map((question) => String(question.id ?? '')),
    );

    const ratingResponses = responses.filter((response) =>
      ratingQuestionIds.has(response.questionId),
    );
    if (ratingResponses.length === 0) {
      return null;
    }

    const total = ratingResponses.reduce(
      (sum, response) => sum + Number(response.value),
      0,
    );
    return Math.round((total / ratingResponses.length) * 100) / 100;
  }
}
