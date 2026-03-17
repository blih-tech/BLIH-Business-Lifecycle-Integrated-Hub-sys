import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapTrainingCompletionResponse } from '../training.mapper';

@Injectable()
export class GetTrainingCompletionUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string) {
    const c = await this.prisma.trainingCompletion.findUnique({
      where: { id },
    });
    if (!c) throw new NotFoundException('Training completion not found');
    return mapTrainingCompletionResponse(c);
  }
}
