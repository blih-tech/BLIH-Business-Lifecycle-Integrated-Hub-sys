import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapSurvey } from '../relations.mapper';

@Injectable()
export class GetSurveyUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string) {
    const s = await this.prisma.survey.findUnique({ where: { id } });
    if (!s) throw new NotFoundException('Survey not found');
    return mapSurvey(s);
  }
}
