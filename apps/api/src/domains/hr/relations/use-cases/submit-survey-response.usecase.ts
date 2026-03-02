import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import type { SubmitSurveyResponseDto } from '@repo/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapSurveyResponseRecord } from '../relations.mapper';

@Injectable()
export class SubmitSurveyResponseUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(surveyId: string, dto: SubmitSurveyResponseDto) {
    const survey = await this.prisma.survey.findUnique({
      where: { id: surveyId },
    });
    if (!survey) throw new NotFoundException('Survey not found');
    if (survey.status !== 'ACTIVE')
      throw new BadRequestException('Survey is not open for responses');
    const userId = survey.anonymous ? null : (dto.userId ?? null);
    if (!survey.anonymous && !userId)
      throw new BadRequestException(
        'User ID required for non-anonymous survey',
      );
    if (userId)
      await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const record = await this.prisma.surveyResponse.create({
      data: {
        surveyId,
        userId,
        responses: dto.responses as never,
        submittedAt: new Date(),
      },
    });
    return mapSurveyResponseRecord(record);
  }
}
