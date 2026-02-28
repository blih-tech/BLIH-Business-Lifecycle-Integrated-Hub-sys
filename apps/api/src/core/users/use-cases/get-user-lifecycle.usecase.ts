import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';

@Injectable()
export class GetUserLifecycleUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userIdOrKeycloakId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ id: userIdOrKeycloakId }, { keycloakId: userIdOrKeycloakId }],
      },
      select: { id: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const lifecycle = await this.prisma.userLifecycle.findUnique({
      where: { userId: user.id },
    });
    if (!lifecycle) {
      throw new NotFoundException('User lifecycle not found');
    }

    return {
      ...lifecycle,
      onboardedAt: lifecycle.onboardedAt?.toISOString() ?? null,
      suspendedAt: lifecycle.suspendedAt?.toISOString() ?? null,
      terminatedAt: lifecycle.terminatedAt?.toISOString() ?? null,
      createdAt: lifecycle.createdAt.toISOString(),
      updatedAt: lifecycle.updatedAt.toISOString(),
    };
  }
}
