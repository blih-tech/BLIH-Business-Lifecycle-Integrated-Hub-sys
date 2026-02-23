import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';

@Injectable()
export class ListSystemConfigUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute() {
    const [settings, modules, securityPolicy] = await Promise.all([
      this.prisma.systemConfig.findMany(),
      this.prisma.moduleConfig.findMany(),
      this.prisma.securityPolicy.findFirst(),
    ]);

    return {
      settings,
      modules,
      securityPolicy,
    };
  }
}
