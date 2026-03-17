import { registerAs } from '@nestjs/config';
import { env } from './env.config';

export interface KeycloakConfig {
  enabled: boolean;
  url: string;
  realm: string;
  clientId: string;
  clientSecret: string;
  authClientId: string;
  authClientSecret: string;
  authorizationUrl: string;
  tokenUrl: string;
  logoutUrl: string;
  userInfoUrl: string;
  jwksUrl: string;
  authRedirectUri: string;
  authScopes: string;
  adminClientId: string;
  adminUsername: string;
  adminPassword: string;
  expectedAudience: string;
  expectedIssuer: string;
  trustProxyPrincipalHeaders: boolean;
  internalAuthSharedSecret: string;
  enforceMfaForPrivileged: boolean;
  policyVersion: string;
  jwksCacheTtlSeconds: number;
  jwksCacheMaxKeys: number;
}

export default registerAs(
  'keycloak',
  (): KeycloakConfig => ({
    enabled: env.KEYCLOAK_ENABLED,
    url: env.KEYCLOAK_URL,
    realm: env.KEYCLOAK_REALM,
    clientId: env.KEYCLOAK_CLIENT_ID,
    clientSecret: env.KEYCLOAK_CLIENT_SECRET,
    authClientId: env.KEYCLOAK_AUTH_CLIENT_ID,
    authClientSecret: env.KEYCLOAK_AUTH_CLIENT_SECRET,
    authorizationUrl: env.KEYCLOAK_AUTHORIZATION_URL,
    tokenUrl: env.KEYCLOAK_TOKEN_URL,
    logoutUrl: env.KEYCLOAK_LOGOUT_URL,
    userInfoUrl: env.KEYCLOAK_USERINFO_URL,
    jwksUrl: env.KEYCLOAK_JWKS_URL,
    authRedirectUri: env.KEYCLOAK_AUTH_REDIRECT_URI,
    authScopes: env.KEYCLOAK_AUTH_SCOPES,
    adminClientId: env.KEYCLOAK_ADMIN_CLIENT_ID,
    adminUsername: env.KEYCLOAK_ADMIN_USERNAME,
    adminPassword: env.KEYCLOAK_ADMIN_PASSWORD,
    expectedAudience: env.JWT_EXPECTED_AUDIENCE,
    expectedIssuer: env.JWT_EXPECTED_ISSUER,
    trustProxyPrincipalHeaders: env.TRUST_PROXY_PRINCIPAL_HEADERS,
    internalAuthSharedSecret: env.INTERNAL_AUTH_SHARED_SECRET,
    enforceMfaForPrivileged: env.ENFORCE_MFA_FOR_PRIVILEGED,
    policyVersion: env.AUTH_POLICY_VERSION,
    jwksCacheTtlSeconds: env.JWKS_CACHE_TTL_SECONDS,
    jwksCacheMaxKeys: env.JWKS_CACHE_MAX_KEYS,
  }),
);
