import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UserPermissionSnapshotService } from '../../user-permission-snapshot.service';

@Injectable()
export class CreatePermissionUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userPermissionSnapshot: UserPermissionSnapshotService,
  ) {}

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
      throw new NotFoundException('Permission resource not found');
    }
    if (!action) {
      throw new NotFoundException('Permission action not found');
    }

    const slug = `${resource.name.toLowerCase()}:${action.name.toLowerCase()}`;

    const duplicate = await this.prisma.permission.findFirst({
      where: {
        OR: [{ slug }, { resourceId: resource.id, actionId: action.id }],
      },
      select: { id: true },
    });
    if (duplicate) {
      throw new ConflictException(
        `Permission already exists for resource/action: ${slug}`,
      );
    }

    const created = await this.prisma.permission.create({
      data: {
        resourceId: resource.id,
        actionId: action.id,
        slug,
        description: dto.description,
      },
      include: {
        resource: {
          select: { name: true },
        },
        action: {
          select: { name: true },
        },
      },
    });

    this.userPermissionSnapshot.invalidateAll();

    return {
      id: created.id,
      slug: created.slug,
      resourceId: created.resourceId,
      resource: created.resource.name,
      actionId: created.actionId,
      action: created.action.name,
      description: created.description,
      createdAt: created.createdAt,
    };
  }
}
