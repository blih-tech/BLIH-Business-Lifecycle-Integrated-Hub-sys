import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapCvScreeningResponse } from '../cv-screening.mapper';

@Injectable()
export class ListCandidateScreeningsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(candidateId: string) {
    const screenings = await this.prisma.cvScreening.findMany({
      where: { candidateId },
      orderBy: { screenedAt: 'desc' },
      include: {
        screenedBy: { select: { email: true } },
      },
    });

    return screenings.map(mapCvScreeningResponse);
  }
}
