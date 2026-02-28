import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';

@Injectable()
export class GetUserEmploymentUseCase {
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

    const employment = await this.prisma.userEmployment.findUnique({
      where: { userId: user.id },
    });
    if (!employment) {
      throw new NotFoundException('User employment not found');
    }

    return {
      ...employment,
      hiredAt: employment.hiredAt?.toISOString() ?? null,
      probationEndAt: employment.probationEndAt?.toISOString() ?? null,
      confirmedAt: employment.confirmedAt?.toISOString() ?? null,
      createdAt: employment.createdAt.toISOString(),
      updatedAt: employment.updatedAt.toISOString(),
    };
  }
}
