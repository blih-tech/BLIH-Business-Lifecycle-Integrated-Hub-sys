/* eslint-disable @typescript-eslint/no-base-to-string */
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { KeycloakAdminService } from '../../platform/keycloak/keycloak-admin.service';
import { PrismaService } from '../../platform/prisma/prisma.service';
import {
  RBAC_ROLE_BY_NAME,
  RBAC_ROLE_NAMES,
} from '../../platform/prisma/seed/rbac.manifest';
import { env } from '../../config/env.config';
import { UserPermissionSnapshotService } from '../rbac/user-permission-snapshot.service';

@Injectable()
export class SyncRolesJob {
  private readonly logger = new Logger(SyncRolesJob.name);

  constructor(
    private readonly keycloakAdmin: KeycloakAdminService,
    private readonly prisma: PrismaService,
    private readonly userPermissionSnapshot: UserPermissionSnapshotService,
  ) {}

  @Cron('0 */30 * * * *')
  async run(): Promise<void> {
    if (!env.SYNC_ROLES_FROM_KEYCLOAK) {
      this.logger.debug(
        'SYNC_ROLES_FROM_KEYCLOAK=false. Skipping role sync to keep core DB canonical.',
      );
      return;
    }

    const realmName = env.KEYCLOAK_REALM;

    const roles = await this.keycloakAdmin.listRoles(realmName);
    const keycloakRoleNames = new Set(
      roles
        .map((role) => String(role.name ?? '').trim())
        .filter((name) => RBAC_ROLE_BY_NAME.has(name)),
    );

    for (const name of RBAC_ROLE_NAMES) {
      if (!keycloakRoleNames.has(name)) {
        continue;
      }

      const manifestRole = RBAC_ROLE_BY_NAME.get(name);
      if (!manifestRole) {
        continue;
      }

      await this.prisma.role.upsert({
        where: {
          name,
        },
        update: {
          displayName: manifestRole.displayName,
          description: manifestRole.description,
          dataScope: manifestRole.dataScope,
          isSystem: manifestRole.isSystem,
        },
        create: {
          name,
          displayName: manifestRole.displayName,
          description: manifestRole.description,
          dataScope: manifestRole.dataScope,
          isSystem: manifestRole.isSystem,
        },
      });
    }

    for (const name of RBAC_ROLE_NAMES) {
      if (!keycloakRoleNames.has(name)) {
        continue;
      }

      const manifestRole = RBAC_ROLE_BY_NAME.get(name);
      if (!manifestRole) {
        continue;
      }

      if (!manifestRole.parentRoleName) {
        await this.prisma.role.update({
          where: { name },
          data: { parentRoleId: null },
        });
        continue;
      }

      const parentRole = await this.prisma.role.findUnique({
        where: { name: manifestRole.parentRoleName },
        select: { id: true },
      });
      if (!parentRole) {
        continue;
      }

      await this.prisma.role.update({
        where: { name },
        data: { parentRoleId: parentRole.id },
      });
    }

    this.logger.log(
      `Synced ${keycloakRoleNames.size} canonical roles from Keycloak`,
    );

    await this.userPermissionSnapshot.recomputeAllUsers();
  }
}
