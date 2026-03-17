import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import {
  KeycloakAdminRequestError,
  KeycloakAdminService,
} from '../../platform/keycloak/keycloak-admin.service';
import { PrismaService } from '../../platform/prisma/prisma.service';
import { env } from '../../config/env.config';

@Injectable()
export class SyncUsersJob {
  private readonly logger = new Logger(SyncUsersJob.name);

  constructor(
    private readonly keycloakAdmin: KeycloakAdminService,
    private readonly prisma: PrismaService,
  ) {}

  @Cron('0 */15 * * * *')
  async run(): Promise<void> {
    const realmName = env.KEYCLOAK_REALM;

    let users: Record<string, unknown>[];
    try {
      users = await this.keycloakAdmin.listUsers(realmName);
    } catch (error: unknown) {
      if (error instanceof KeycloakAdminRequestError) {
        return;
      }

      throw error;
    }

    for (const user of users) {
      const keycloakId = String(user.id ?? '');
      const username = String(user.username ?? user.email ?? keycloakId);
      const email = String(user.email ?? `${keycloakId}@placeholder.local`);
      await this.prisma.$transaction(async (tx) => {
        const syncedUser = await tx.user.upsert({
          where: { keycloakId },
          update: {
            username,
            email,
            firstName: String(user.firstName ?? 'Unknown'),
            lastName: String(user.lastName ?? 'User'),
          },
          create: {
            keycloakId,
            username,
            email,
            firstName: String(user.firstName ?? 'Unknown'),
            lastName: String(user.lastName ?? 'User'),
          },
        });

        await tx.employee.upsert({
          where: {
            userId: syncedUser.id,
          },
          update: {},
          create: {
            id: syncedUser.id,
            userId: syncedUser.id,
          },
        });
      });
    }

    this.logger.log(`Synced ${users.length} users from Keycloak`);
  }
}
