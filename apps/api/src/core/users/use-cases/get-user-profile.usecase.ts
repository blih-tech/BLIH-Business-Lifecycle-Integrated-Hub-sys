import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';

@Injectable()
export class GetUserProfileUseCase {
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

    const profile = await this.prisma.userProfile.findUnique({
      where: { userId: user.id },
      include: {
        nationality: {
          select: { name: true },
        },
        country: {
          select: { name: true },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('User profile not found');
    }

    return {
      ...profile,
      nationality: profile.nationality?.name ?? null,
      country: profile.country?.name ?? null,
      dateOfBirth: profile.dateOfBirth?.toISOString() ?? null,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
    };
  }
}
