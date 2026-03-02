import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import type { SurveyAggregateResultsDto, SurveyQuestion } from '@repo/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';

@Injectable()
export class GetSurveyResultsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(surveyId: string): Promise<SurveyAggregateResultsDto> {
    const survey = await this.prisma.survey.findUnique({
      where: { id: surveyId },
      include: { responses: true },
    });
    if (!survey) throw new NotFoundException('Survey not found');
    if (survey.status !== 'CLOSED')
      throw new ForbiddenException(
        'Survey results available only when survey is closed',
      );
    const questions = (survey.questions as unknown as SurveyQuestion[]) ?? [];
    const totalResponses = survey.responses.length;
    const questionResults = questions.map((q) => {
      const values = survey.responses
        .map((r) => {
          const resp = r.responses as Record<string, unknown>;
          return resp[q.id];
        })
        .filter((v) => v !== undefined && v !== null);
      if (q.type === 'scale' && values.length > 0) {
        const nums = values.map((v) => Number(v));
        const valid = nums.filter((n) => !Number.isNaN(n));
        const average = valid.length
          ? valid.reduce((a, b) => a + b, 0) / valid.length
          : undefined;
        return {
          questionId: q.id,
          questionText: q.text,
          type: q.type,
          average,
        };
      }
      if ((q.type === 'single' || q.type === 'multiple') && values.length > 0) {
        const distribution: Record<string, number> = {};
        for (const v of values) {
          const key = Array.isArray(v) ? (v as unknown[]).join(',') : String(v);
          distribution[key] = (distribution[key] ?? 0) + 1;
        }
        return {
          questionId: q.id,
          questionText: q.text,
          type: q.type,
          distribution,
        };
      }
      if (q.type === 'text' && values.length > 0) {
        return {
          questionId: q.id,
          questionText: q.text,
          type: q.type,
          textResponses: values.map(String),
        };
      }
      return { questionId: q.id, questionText: q.text, type: q.type };
    });
    return { surveyId, totalResponses, questionResults };
  }
}
