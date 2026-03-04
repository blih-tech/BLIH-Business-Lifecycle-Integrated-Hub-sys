import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapInterviewFeedbackResponse } from '../interview-feedback.mapper';

@Injectable()
export class ListInterviewFeedbackUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(candidateId: string) {
    const feedback = await this.prisma.interviewFeedback.findMany({
      where: { candidateId },
      orderBy: [{ interviewRound: 'asc' }, { createdAt: 'asc' }],
      include: {
        compiledBy: { select: { email: true } },
      },
    });

    return feedback.map(mapInterviewFeedbackResponse);
  }
}
