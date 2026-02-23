import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import keycloakConfig from '../../config/keycloak.config';
import { KEYCLOAK_INTROSPECT_PATH } from './keycloak.constants';
import { KeycloakIntrospectionResponse } from './keycloak.types';

@Injectable()
export class KeycloakIntrospectionService {
  constructor(
    private readonly httpService: HttpService,
    @Inject(keycloakConfig.KEY)
    private readonly keycloak: ConfigType<typeof keycloakConfig>,
  ) {}

  async introspect(
    token: string,
    realm = this.keycloak.realm,
  ): Promise<KeycloakIntrospectionResponse> {
    const url = `${this.keycloak.url}/realms/${realm}${KEYCLOAK_INTROSPECT_PATH}`;
    const body = new URLSearchParams({
      token,
      client_id: this.keycloak.clientId,
      client_secret: this.keycloak.clientSecret,
    });
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
    const payload = Object.fromEntries(body.entries());
    console.log(
      '[KeycloakIntrospectionService] OUTGOING REQUEST',
      JSON.stringify(
        {
          requestType: 'OUTGOING_KEYCLOAK_INTROSPECT',
          method: 'POST',
          url,
          headers,
          payload,
        },
        null,
        2,
      ),
    );

    try {
      const response = await firstValueFrom(
        this.httpService.post<KeycloakIntrospectionResponse>(
          url,
          body.toString(),
          {
            headers,
          },
        ),
      );
      console.log(
        '[KeycloakIntrospectionService] OUTGOING RESPONSE',
        JSON.stringify(
          {
            requestType: 'OUTGOING_KEYCLOAK_INTROSPECT_RESPONSE',
            url,
            status: response.status,
            statusText: response.statusText,
            data: response.data,
          },
          null,
          2,
        ),
      );
      return response.data;
    } catch (err: unknown) {
      const ax =
        err && typeof err === 'object' && 'response' in err
          ? (
              err as {
                response?: {
                  status?: number;
                  statusText?: string;
                  data?: unknown;
                  headers?: unknown;
                };
              }
            ).response
          : undefined;
      console.log(
        '[KeycloakIntrospectionService] OUTGOING ERROR RESPONSE',
        JSON.stringify(
          {
            requestType: 'OUTGOING_KEYCLOAK_INTROSPECT_ERROR',
            url,
            errorResponse: ax
              ? {
                  status: ax.status,
                  statusText: ax.statusText,
                  data: ax.data,
                  headers: ax.headers,
                }
              : null,
            errorMessage: err instanceof Error ? err.message : String(err),
          },
          null,
          2,
        ),
      );
      throw err;
    }
  }
}
