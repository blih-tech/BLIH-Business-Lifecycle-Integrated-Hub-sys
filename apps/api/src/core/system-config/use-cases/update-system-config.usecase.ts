import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import { SystemConfigDto } from '../dto/system-config.dto';

@Injectable()
export class UpdateSystemConfigUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: SystemConfigDto) {
    const config = await this.prisma.systemConfig.upsert({
      where: { key: dto.key },
      update: {
        value: dto.value as Prisma.InputJsonValue,
      },
      create: {
        key: dto.key,
        value: dto.value as Prisma.InputJsonValue,
      },
    });

    return config;
  }
}
