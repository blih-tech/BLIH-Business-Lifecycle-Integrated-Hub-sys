import { Injectable, NotFoundException } from '@nestjs/common';
import { env } from '../../../config/env.config';
import { KeycloakAdminService } from '../../../platform/keycloak/keycloak-admin.service';
import { PrincipalEnrichmentService } from '../../../platform/keycloak/principal-enrichment.service';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    private readonly keycloakAdmin: KeycloakAdminService,
    private readonly prisma: PrismaService,
    private readonly principalEnrichment: PrincipalEnrichmentService,
  ) {}

  async execute(userId: string, dto: UpdateUserDto) {
    const realmName = env.KEYCLOAK_REALM;

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ id: userId }, { keycloakId: userId }],
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.keycloakAdmin.updateUser(realmName, user.keycloakId, {
      email: dto.email ?? user.email,
      firstName: dto.firstName ?? user.firstName,
      lastName: dto.lastName ?? user.lastName,
    });

    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
      },
    });

    this.principalEnrichment.invalidateContext(updated.keycloakId);

    return updated;
  }
}
