import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { UpdatePermissionDto } from '../dto/update-permission.dto';

@Injectable()
export class UpdatePermissionUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(permissionId: string, dto: UpdatePermissionDto) {
    const existing = await this.prisma.permission.findUnique({
      where: { id: permissionId },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Permission not found');
    }

    return this.prisma.permission.update({
      where: { id: permissionId },
      data: {
        description: dto.description,
      },
    });
  }
}
