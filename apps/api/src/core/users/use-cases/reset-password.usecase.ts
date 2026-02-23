import { Injectable, NotFoundException } from '@nestjs/common';
import { env } from '../../../config/env.config';
import { KeycloakAdminService } from '../../../platform/keycloak/keycloak-admin.service';
import { PrismaService } from '../../../platform/prisma/prisma.service';

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    private readonly keycloakAdmin: KeycloakAdminService,
    private readonly prisma: PrismaService,
  ) {}

  async execute(userId: string, password: string) {
    const realmName = env.KEYCLOAK_REALM;

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ id: userId }, { keycloakId: userId }],
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.keycloakAdmin.resetUserPassword(
      realmName,
      user.keycloakId,
      password,
    );

    return { success: true };
  }
}
