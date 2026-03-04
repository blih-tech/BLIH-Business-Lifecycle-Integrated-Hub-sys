import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapRecognition } from '../relations.mapper';

@Injectable()
export class GetRecognitionUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string) {
    const r = await this.prisma.recognition.findUnique({ where: { id } });
    if (!r) throw new NotFoundException('Recognition not found');
    return mapRecognition(r);
  }
}
