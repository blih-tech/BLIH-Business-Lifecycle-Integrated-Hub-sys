import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapResignation } from '../offboarding.mapper';

@Injectable()
export class GetResignationUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string) {
    const r = await this.prisma.resignation.findUnique({ where: { id } });
    if (!r) throw new NotFoundException('Resignation not found');
    return mapResignation(r);
  }
}
