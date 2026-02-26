import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { CreateResourceDto } from '../dto/create-resource.dto';

@Injectable()
export class CreateResourceUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateResourceDto) {
    const normalizedName = dto.name.trim().toLowerCase();

    const existing = await this.prisma.permissionResource.findUnique({
      where: { name: normalizedName },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException(`Resource already exists: ${normalizedName}`);
    }

    return this.prisma.permissionResource.create({
      data: {
        name: normalizedName,
        description: dto.description,
      },
    });
  }
}
