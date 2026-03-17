import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapConflictMediation } from '../relations.mapper';

@Injectable()
export class GetMediationUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string) {
    const m = await this.prisma.conflictMediation.findUnique({ where: { id } });
    if (!m) throw new NotFoundException('Conflict mediation not found');
    return mapConflictMediation(m);
  }
}
