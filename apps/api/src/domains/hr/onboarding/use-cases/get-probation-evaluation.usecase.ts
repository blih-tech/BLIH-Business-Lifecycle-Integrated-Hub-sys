import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapProbationEvaluationResponse } from '../probation.mapper';

@Injectable()
export class GetProbationEvaluationUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string) {
    const evaluation = await this.prisma.probationEvaluation.findUnique({
      where: { id },
    });
    if (!evaluation)
      throw new NotFoundException('Probation evaluation not found');
    return mapProbationEvaluationResponse(evaluation);
  }
}
