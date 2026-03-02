import { Injectable } from '@nestjs/common';
import type { CreateSurveyDto } from '@repo/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapSurvey } from '../relations.mapper';

@Injectable()
export class CreateSurveyUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateSurveyDto) {
    await this.prisma.user.findUniqueOrThrow({
      where: { id: dto.createdById },
    });
    const survey = await this.prisma.survey.create({
      data: {
        title: dto.title,
        description: dto.description ?? null,
        type: (dto.type ?? 'SATISFACTION') as never,
        questions: (dto.questions ?? []) as never,
        anonymous: dto.anonymous ?? false,
        status: 'DRAFT',
        createdById: dto.createdById,
        opensAt: dto.opensAt ? new Date(dto.opensAt) : null,
        closesAt: dto.closesAt ? new Date(dto.closesAt) : null,
      },
    });
    return mapSurvey(survey);
  }
}
