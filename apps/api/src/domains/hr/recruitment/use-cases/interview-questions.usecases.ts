import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import type {
  CreateInterviewQuestionDto,
  InterviewQuestionListQueryDto,
  UpdateInterviewQuestionDto,
} from '../dto/interview-question.dto';
import {
  mapInterviewQuestion,
  normalizeStringArray,
} from './recruitment.usecase-helpers';

const SELECT_BASED_TYPES = new Set(['SINGLE_SELECT', 'MULTI_SELECT']);

function normalizeQuestionText(value: string) {
  const normalized = value.trim();
  if (!normalized) {
    throw new BadRequestException('Question is required');
  }
  return normalized;
}

function normalizeNullableText(value: string | null | undefined) {
  if (value === undefined) return undefined;
  if (value == null) return null;
  const normalized = value.trim();
  return normalized || null;
}

function normalizeTags(values: string[] | null | undefined) {
  const seen = new Set<string>();
  const normalized: string[] = [];
  for (const value of values ?? []) {
    const key = value.trim().toLowerCase();
    if (!key) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    normalized.push(key);
  }
  return normalized;
}

function normalizeTypeOptions(type: string, options: string[]) {
  if (SELECT_BASED_TYPES.has(type)) {
    if (options.length === 0) {
      throw new BadRequestException(
        'Options are required for SINGLE_SELECT and MULTI_SELECT question types',
      );
    }
    return options;
  }
  return [];
}

function normalizeTagsFilter(tags: string | undefined) {
  if (!tags) return [];
  return normalizeTags(tags.split(','));
}

@Injectable()
export class CreateInterviewQuestionUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateInterviewQuestionDto, createdById: string) {
    const options = normalizeTypeOptions(
      dto.type,
      normalizeStringArray(dto.options ?? []),
    );

    const row = await this.prisma.interviewQuestion.create({
      data: {
        question: normalizeQuestionText(dto.question),
        description: normalizeNullableText(dto.description) ?? undefined,
        category: dto.category ?? undefined,
        type: dto.type,
        options,
        difficulty: dto.difficulty ?? undefined,
        tags: normalizeTags(dto.tags),
        createdById,
        isActive: dto.isActive ?? true,
      },
    });

    return mapInterviewQuestion(row);
  }
}

@Injectable()
export class UpdateInterviewQuestionUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, dto: UpdateInterviewQuestionDto) {
    const existing = await this.prisma.interviewQuestion.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Interview question not found');
    }

    const nextType = dto.type ?? existing.type;
    const nextOptionsInput =
      dto.options !== undefined
        ? normalizeStringArray(dto.options)
        : (existing.options ?? []);
    const nextOptions = normalizeTypeOptions(nextType, nextOptionsInput);

    const row = await this.prisma.interviewQuestion.update({
      where: { id },
      data: {
        ...(dto.question !== undefined
          ? { question: normalizeQuestionText(dto.question) }
          : {}),
        ...(dto.description !== undefined
          ? { description: normalizeNullableText(dto.description) }
          : {}),
        ...(dto.category !== undefined ? { category: dto.category } : {}),
        ...(dto.type !== undefined ? { type: dto.type } : {}),
        ...(dto.options !== undefined || dto.type !== undefined
          ? { options: nextOptions }
          : {}),
        ...(dto.difficulty !== undefined ? { difficulty: dto.difficulty } : {}),
        ...(dto.tags !== undefined ? { tags: normalizeTags(dto.tags) } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
    });

    return mapInterviewQuestion(row);
  }
}

@Injectable()
export class DeactivateInterviewQuestionUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string) {
    const existing = await this.prisma.interviewQuestion.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException('Interview question not found');
    }

    const row = await this.prisma.interviewQuestion.update({
      where: { id },
      data: { isActive: false },
    });
    return mapInterviewQuestion(row);
  }
}

@Injectable()
export class ListInterviewQuestionsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: InterviewQuestionListQueryDto) {
    const tags = normalizeTagsFilter(query.tags);

    const rows = await this.prisma.interviewQuestion.findMany({
      where: {
        ...(query.category ? { category: query.category } : {}),
        ...(query.difficulty !== undefined
          ? { difficulty: query.difficulty }
          : {}),
        isActive: query.isActive ?? true,
        ...(tags.length > 0 ? { tags: { hasSome: tags } } : {}),
      },
      orderBy: { updatedAt: 'desc' },
    });

    return rows.map((row) => mapInterviewQuestion(row));
  }
}
