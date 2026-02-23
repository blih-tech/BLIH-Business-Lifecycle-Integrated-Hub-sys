import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import keycloakConfig from '../../config/keycloak.config';
import { KeycloakRealmNotFoundError } from './keycloak.errors';
import { KeycloakTokenService } from './keycloak-token.service';
import { KeycloakUserRepresentation, RealmSummary } from './keycloak.types';

@Injectable()
export class KeycloakAdminService {
  private readonly logger = new Logger(KeycloakAdminService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly tokenService: KeycloakTokenService,
    @Inject(keycloakConfig.KEY)
    private readonly keycloak: ConfigType<typeof keycloakConfig>,
  ) {}

  async listRealms(): Promise<RealmSummary[]> {
    return this.adminRequest<RealmSummary[]>('GET', `/admin/realms`);
  }

  async createRealm(realm: string): Promise<void> {
    await this.adminRequest('POST', `/admin/realms`, { realm, enabled: true });
  }

  async updateRealm(
    realm: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    await this.ensureRealmExists(realm);
    await this.adminRequest('PUT', `/admin/realms/${realm}`, payload);
  }

  async deleteRealm(realm: string): Promise<void> {
    await this.ensureRealmExists(realm);
    await this.adminRequest('DELETE', `/admin/realms/${realm}`);
  }

  async createUser(
    realm: string,
    payload: Record<string, unknown>,
  ): Promise<string | null> {
    const response = await this.adminRequestRaw(
      'POST',
      `/admin/realms/${realm}/users`,
      payload,
    );
    const location = response.headers.location as string | undefined;
    return location?.split('/').pop() ?? null;
  }

  async updateUser(
    realm: string,
    userId: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    await this.adminRequest(
      'PUT',
      `/admin/realms/${realm}/users/${userId}`,
      payload,
    );
  }

  async disableUser(realm: string, userId: string): Promise<void> {
    await this.adminRequest('PUT', `/admin/realms/${realm}/users/${userId}`, {
      enabled: false,
    });
  }

  async resetUserPassword(
    realm: string,
    userId: string,
    password: string,
  ): Promise<void> {
    await this.adminRequest(
      'PUT',
      `/admin/realms/${realm}/users/${userId}/reset-password`,
      {
        type: 'password',
        temporary: true,
        value: password,
      },
    );
  }

  async listUsers(realm: string): Promise<Record<string, unknown>[]> {
    return this.adminRequest<Record<string, unknown>[]>(
      'GET',
      `/admin/realms/${realm}/users`,
    );
  }

  async getUserById(
    realm: string,
    userId: string,
  ): Promise<KeycloakUserRepresentation | null> {
    try {
      return await this.adminRequest<KeycloakUserRepresentation>(
        'GET',
        `/admin/realms/${realm}/users/${userId}`,
      );
    } catch (err: unknown) {
      const status =
        err && typeof err === 'object' && 'response' in err
          ? (
              err as {
                response?: {
                  status?: number;
                };
              }
            ).response?.status
          : undefined;

      if (status === 404) {
        return null;
      }

      throw err;
    }
  }

  async createRole(
    realm: string,
    name: string,
    description?: string,
  ): Promise<void> {
    await this.adminRequest('POST', `/admin/realms/${realm}/roles`, {
      name,
      description,
    });
  }

  async listRoles(realm: string): Promise<Record<string, unknown>[]> {
    return this.adminRequest<Record<string, unknown>[]>(
      'GET',
      `/admin/realms/${realm}/roles`,
    );
  }

  async getRole(
    realm: string,
    roleName: string,
  ): Promise<Record<string, unknown> | null> {
    const encodedRoleName = encodeURIComponent(roleName);
    try {
      return await this.adminRequest<Record<string, unknown>>(
        'GET',
        `/admin/realms/${realm}/roles/${encodedRoleName}`,
      );
    } catch (err: unknown) {
      const status =
        err && typeof err === 'object' && 'response' in err
          ? (
              err as {
                response?: {
                  status?: number;
                };
              }
            ).response?.status
          : undefined;
      if (status === 404) {
        return null;
      }
      throw err;
    }
  }

  async updateRole(
    realm: string,
    roleName: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const encodedRoleName = encodeURIComponent(roleName);
    await this.adminRequest(
      'PUT',
      `/admin/realms/${realm}/roles/${encodedRoleName}`,
      payload,
    );
  }

  async deleteRole(realm: string, roleName: string): Promise<void> {
    const encodedRoleName = encodeURIComponent(roleName);
    await this.adminRequest(
      'DELETE',
      `/admin/realms/${realm}/roles/${encodedRoleName}`,
    );
  }

  async assignRealmRole(
    realm: string,
    userId: string,
    role: Record<string, unknown>,
  ): Promise<void> {
    await this.adminRequest(
      'POST',
      `/admin/realms/${realm}/users/${userId}/role-mappings/realm`,
      [role],
    );
  }

  async revokeRealmRole(
    realm: string,
    userId: string,
    role: Record<string, unknown>,
  ): Promise<void> {
    await this.adminRequest(
      'DELETE',
      `/admin/realms/${realm}/users/${userId}/role-mappings/realm`,
      [role],
    );
  }

  private async ensureRealmExists(realm: string): Promise<void> {
    const realms = await this.listRealms();
    if (!realms.some((item) => item.realm === realm)) {
      throw new KeycloakRealmNotFoundError(`Realm ${realm} not found`);
    }
  }

  private async adminRequest<TData = void>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    data?: unknown,
  ): Promise<TData> {
    const response = await this.adminRequestRaw<TData>(method, path, data);
    return response.data;
  }

  private async adminRequestRaw<TData = void>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    data?: unknown,
  ) {
    const token = await this.getAdminToken();
    const url = `${this.keycloak.url}${path}`;

    this.logger.verbose(`${method} ${url}`);

    return firstValueFrom(
      this.httpService.request<TData>({
        method,
        url,
        data,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    );
  }

  private async getAdminToken(): Promise<string> {
    if (this.keycloak.adminUsername && this.keycloak.adminPassword) {
      const params = new URLSearchParams({
        grant_type: 'password',
        client_id: this.keycloak.adminClientId,
        username: this.keycloak.adminUsername,
        password: this.keycloak.adminPassword,
      });

      const response = await firstValueFrom(
        this.httpService.post<{ access_token: string }>(
          `${this.keycloak.url}/realms/master/protocol/openid-connect/token`,
          params.toString(),
          {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          },
        ),
      );

      return response.data.access_token;
    }

    const token = await this.tokenService.getServiceToken();
    return token.access_token;
  }
}
