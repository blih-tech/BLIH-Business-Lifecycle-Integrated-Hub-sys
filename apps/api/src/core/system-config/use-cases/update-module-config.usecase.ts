import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import { ModuleConfigDto } from '../dto/module-config.dto';

@Injectable()
export class UpdateModuleConfigUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: ModuleConfigDto) {
    const config = await this.prisma.moduleConfig.upsert({
      where: { module: dto.module },
      update: {
        enabled: dto.enabled,
        licenseKey: dto.licenseKey,
      },
      create: {
        module: dto.module,
        enabled: dto.enabled,
        licenseKey: dto.licenseKey,
      },
    });

    return config;
  }
}
