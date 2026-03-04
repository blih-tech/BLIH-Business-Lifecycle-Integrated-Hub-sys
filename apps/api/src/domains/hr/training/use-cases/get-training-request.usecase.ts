import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapTrainingRequestResponse } from '../training.mapper';

@Injectable()
export class GetTrainingRequestUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string) {
    const request = await this.prisma.trainingRequest.findUnique({
      where: { id },
    });
    if (!request) throw new NotFoundException('Training request not found');
    return mapTrainingRequestResponse(request);
  }
}
