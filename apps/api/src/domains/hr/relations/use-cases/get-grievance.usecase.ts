import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapGrievance } from '../relations.mapper';

@Injectable()
export class GetGrievanceUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string) {
    const g = await this.prisma.grievance.findUnique({ where: { id } });
    if (!g) throw new NotFoundException('Grievance not found');
    return mapGrievance(g);
  }
}
