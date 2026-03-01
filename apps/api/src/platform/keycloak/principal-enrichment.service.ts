import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserStatus } from '../prisma/prisma-client';
import { PrismaService } from '../prisma/prisma.service';
import { KeycloakAdminService } from './keycloak-admin.service';
import { KeycloakProfileClaims } from './keycloak.types';

export interface PrincipalContext {
  userId?: string;
  keycloakId?: string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  status?: string;
  departmentId?: string | null;
}

/**
 * Enriches the auth principal with User record data (username, email, name, status, etc.).
 */
@Injectable()
export class PrincipalEnrichmentService {
  private readonly cache = new Map<
    string,
    { value: PrincipalContext; expiresAt: number }
  >();
  private readonly cacheTtlMs: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly keycloakAdmin: KeycloakAdminService,
  ) {
    this.cacheTtlMs = Number(
      this.configService.get<string>('PRINCIPAL_CONTEXT_TTL_MS', '30000'),
    );
  }

  async getContext(
    keycloakId: string,
    profileClaims: KeycloakProfileClaims = {},
  ): Promise<PrincipalContext> {
    const realmName = this.configService.get<string>('KEYCLOAK_REALM', 'blih');
    const cacheKey = keycloakId;
    const now = Date.now();
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      return cached.value;
    }

    try {
      const normalizedClaims = this.normalizeClaims(profileClaims);

      let user = await this.prisma.user.findFirst({
        where: {
          keycloakId,
        },
        select: {
          id: true,
          keycloakId: true,
          username: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          status: true,
          employment: {
            select: {
              position: {
                select: {
                  departmentId: true,
                },
              },
            },
          },
        },
      });

      if (!user) {
        const username =
          normalizedClaims.username?.trim() ||
          normalizedClaims.email?.trim() ||
          keycloakId;
        const created = await this.prisma.user.create({
          data: {
            keycloakId,
            username,
            email:
              normalizedClaims.email?.trim() ||
              `${keycloakId}@placeholder.local`,
            firstName: normalizedClaims.firstName ?? 'Unknown',
            lastName: normalizedClaims.lastName ?? 'User',
            status: UserStatus.ACTIVE,
          },
          select: {
            id: true,
            keycloakId: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            status: true,
            employment: {
              select: {
                position: {
                  select: {
                    departmentId: true,
                  },
                },
              },
            },
          },
        });
        user = created;
      } else {
        const updateData: {
          username?: string;
          email?: string;
          firstName?: string;
          lastName?: string;
        } = {};

        if (
          normalizedClaims.email &&
          (user.email.endsWith('@placeholder.local') ||
            user.email.trim() === '')
        ) {
          updateData.email = normalizedClaims.email;
        }
        if (
          normalizedClaims.firstName &&
          (user.firstName.trim() === '' || user.firstName === 'Unknown')
        ) {
          updateData.firstName = normalizedClaims.firstName;
        }
        if (
          normalizedClaims.lastName &&
          (user.lastName.trim() === '' || user.lastName === 'User')
        ) {
          updateData.lastName = normalizedClaims.lastName;
        }
        const existingUsername = (user as { username?: string }).username;
        if (
          normalizedClaims.username?.trim() &&
          (!existingUsername || existingUsername.trim() === '')
        ) {
          updateData.username = normalizedClaims.username.trim();
        }

        if (Object.keys(updateData).length > 0) {
          user = await this.prisma.user.update({
            where: { id: user.id },
            data: updateData,
            select: {
              id: true,
              keycloakId: true,
              username: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
              status: true,
              employment: {
                select: {
                  position: {
                    select: {
                      departmentId: true,
                    },
                  },
                },
              },
            },
          });
        }
      }

      const context: PrincipalContext = {
        userId: user.id,
        keycloakId: user.keycloakId,
        username: user.username ?? normalizedClaims.username,
        email: user.email || normalizedClaims.email || undefined,
        firstName: user.firstName || normalizedClaims.firstName || undefined,
        lastName: user.lastName || normalizedClaims.lastName || undefined,
        phone: user.phone ?? undefined,
        status: user.status ?? undefined,
        departmentId: user.employment?.position?.departmentId ?? null,
      };

      if (
        !context.username ||
        !context.email ||
        !context.firstName ||
        !context.lastName
      ) {
        const keycloakUser = await this.keycloakAdmin.getUserById(
          realmName,
          keycloakId,
        );
        if (keycloakUser) {
          context.username =
            context.username || keycloakUser.username || undefined;
          context.email = context.email ?? keycloakUser.email ?? undefined;
          context.firstName =
            context.firstName ?? keycloakUser.firstName ?? undefined;
          context.lastName =
            context.lastName ?? keycloakUser.lastName ?? undefined;
          if (!context.status && keycloakUser.enabled != null) {
            context.status = keycloakUser.enabled ? 'ACTIVE' : 'DISABLED';
          }
        }
      }

      this.cache.set(cacheKey, {
        value: context,
        expiresAt: now + this.cacheTtlMs,
      });

      return context;
    } catch {
      this.cache.delete(cacheKey);
      return {};
    }
  }

  invalidateContext(keycloakId: string): void {
    this.cache.delete(keycloakId);
  }

  private normalizeClaims(
    claims: KeycloakProfileClaims,
  ): KeycloakProfileClaims {
    const fullName = this.clean(claims.fullName);
    const firstName = this.clean(claims.firstName);
    const lastName = this.clean(claims.lastName);

    if ((firstName && lastName) || !fullName) {
      return {
        ...claims,
        email: this.clean(claims.email),
        username: this.clean(claims.username),
        firstName,
        lastName,
        fullName,
      };
    }

    const [derivedFirstName, ...rest] = fullName.split(' ').filter(Boolean);
    const derivedLastName = rest.join(' ').trim();

    return {
      ...claims,
      email: this.clean(claims.email),
      username: this.clean(claims.username),
      firstName: firstName ?? derivedFirstName ?? undefined,
      lastName: lastName ?? derivedLastName ?? undefined,
      fullName,
    };
  }

  private clean(value: string | undefined): string | undefined {
    const normalized = String(value ?? '').trim();
    return normalized.length > 0 ? normalized : undefined;
  }
}
