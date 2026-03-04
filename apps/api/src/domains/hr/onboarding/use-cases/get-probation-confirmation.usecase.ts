import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapProbationConfirmationResponse } from '../probation.mapper';

@Injectable()
export class GetProbationConfirmationUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string) {
    const record = await this.prisma.probationConfirmation.findUnique({
      where: { id },
    });
    if (!record)
      throw new NotFoundException('Probation confirmation not found');
    return mapProbationConfirmationResponse(record);
  }
}
