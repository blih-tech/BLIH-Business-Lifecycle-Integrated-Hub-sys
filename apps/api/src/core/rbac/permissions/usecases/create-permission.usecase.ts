import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { CreatePermissionDto } from '../dto/create-permission.dto';

@Injectable()
export class CreatePermissionUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreatePermissionDto) {
    const [resource, action] = await Promise.all([
      this.prisma.permissionResource.findUnique({
        where: { id: dto.resourceId },
        select: { id: true, name: true },
      }),
      this.prisma.permissionAction.findUnique({
        where: { id: dto.actionId },
        select: { id: true, name: true },
      }),
    ]);

    if (!resource) {
      throw new BadRequestException('Invalid resourceId');
    }
    if (!action) {
      throw new BadRequestException('Invalid actionId');
    }

    const slug = `${resource.name}:${action.name}`;

    try {
      return await this.prisma.permission.create({
        data: {
          resourceId: resource.id,
          actionId: action.id,
          slug,
          description: dto.description,
        },
      });
    } catch {
      throw new BadRequestException(
        'Permission resource/action pair already exists',
      );
    }
  }
}
