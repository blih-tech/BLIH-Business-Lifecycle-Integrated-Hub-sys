import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { CreateActionDto } from '../dto/create-action.dto';

@Injectable()
export class CreateActionUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateActionDto) {
    const normalizedName = dto.name.trim().toLowerCase();

    const existing = await this.prisma.permissionAction.findUnique({
      where: { name: normalizedName },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException(`Action already exists: ${normalizedName}`);
    }

    return this.prisma.permissionAction.create({
      data: {
        name: normalizedName,
        description: dto.description,
      },
    });
  }
}
