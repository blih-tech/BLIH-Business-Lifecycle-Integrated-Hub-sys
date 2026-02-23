import { env, resetEnvCache } from './env.config';

describe('env.config', () => {
  const originalKeycloakClientId = process.env.KEYCLOAK_CLIENT_ID;
  const originalKeycloakClientSecret = process.env.KEYCLOAK_CLIENT_SECRET;
  const originalEnforceMfa = process.env.ENFORCE_MFA_FOR_PRIVILEGED;

  afterEach(() => {
    if (originalKeycloakClientId === undefined) {
      delete process.env.KEYCLOAK_CLIENT_ID;
    } else {
      process.env.KEYCLOAK_CLIENT_ID = originalKeycloakClientId;
    }

    if (originalKeycloakClientSecret === undefined) {
      delete process.env.KEYCLOAK_CLIENT_SECRET;
    } else {
      process.env.KEYCLOAK_CLIENT_SECRET = originalKeycloakClientSecret;
    }

    if (originalEnforceMfa === undefined) {
      delete process.env.ENFORCE_MFA_FOR_PRIVILEGED;
    } else {
      process.env.ENFORCE_MFA_FOR_PRIVILEGED = originalEnforceMfa;
    }

    resetEnvCache();
  });

  it('defaults ENFORCE_MFA_FOR_PRIVILEGED to false', () => {
    delete process.env.ENFORCE_MFA_FOR_PRIVILEGED;
    resetEnvCache();

    expect(env.ENFORCE_MFA_FOR_PRIVILEGED).toBe(false);
  });

  it('reads Keycloak client credentials from runtime environment', () => {
    process.env.KEYCLOAK_CLIENT_ID = 'runtime-client-id';
    process.env.KEYCLOAK_CLIENT_SECRET = 'runtime-client-secret';
    resetEnvCache();

    expect(env.KEYCLOAK_CLIENT_ID).toBe('runtime-client-id');
    expect(env.KEYCLOAK_CLIENT_SECRET).toBe('runtime-client-secret');
  });
});
