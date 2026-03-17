import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import type { SubmitSurveyResponseDto } from '@repo/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { resolveEmployeeSubjectOrThrow } from '../../employees/employee-subject.utils';
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
    const employeeId = survey.anonymous ? null : (dto.employeeId ?? null);
    if (!survey.anonymous && !employeeId)
      throw new BadRequestException(
        'Employee ID required for non-anonymous survey',
      );
    const employee = employeeId
      ? await resolveEmployeeSubjectOrThrow(
          this.prisma,
          employeeId,
          'Employee not found',
        )
      : null;
    const record = await this.prisma.surveyResponse.create({
      data: {
        surveyId,
        employeeId: employee?.id ?? null,
        responses: dto.responses as never,
        submittedAt: new Date(),
      },
    });
    return mapSurveyResponseRecord(record);
  }
}
