import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapDisciplinaryAction } from '../relations.mapper';

@Injectable()
export class GetDisciplinaryActionUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string) {
    const a = await this.prisma.disciplinaryAction.findUnique({
      where: { id },
    });
    if (!a) throw new NotFoundException('Disciplinary action not found');
    return mapDisciplinaryAction(a);
  }
}
