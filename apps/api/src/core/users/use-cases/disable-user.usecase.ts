import { Injectable, NotFoundException } from '@nestjs/common';
import { env } from '../../../config/env.config';
import { KeycloakAdminService } from '../../../platform/keycloak/keycloak-admin.service';
import { PrincipalEnrichmentService } from '../../../platform/keycloak/principal-enrichment.service';
import { PrismaService } from '../../../platform/prisma/prisma.service';

@Injectable()
export class DisableUserUseCase {
  constructor(
    private readonly keycloakAdmin: KeycloakAdminService,
    private readonly prisma: PrismaService,
    private readonly principalEnrichment: PrincipalEnrichmentService,
  ) {}

  async execute(userId: string) {
    const realmName = env.KEYCLOAK_REALM;

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ id: userId }, { keycloakId: userId }],
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.keycloakAdmin.disableUser(realmName, user.keycloakId);
    const disabled = await this.prisma.user.update({
      where: { id: user.id },
      data: { status: 'DISABLED' },
    });

    this.principalEnrichment.invalidateContext(disabled.keycloakId);

    return disabled;
  }
}
