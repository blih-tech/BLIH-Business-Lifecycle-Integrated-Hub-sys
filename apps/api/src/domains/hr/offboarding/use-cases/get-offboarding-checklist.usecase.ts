import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapOffboardingChecklist } from '../offboarding.mapper';

@Injectable()
export class GetOffboardingChecklistUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string) {
    const c = await this.prisma.offboardingChecklist.findUnique({
      where: { id },
      include: { tasks: true },
    });
    if (!c) throw new NotFoundException('Offboarding checklist not found');
    return mapOffboardingChecklist(c);
  }
}
