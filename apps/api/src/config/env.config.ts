import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),
  API_HOST: Joi.string().default('127.0.0.1'),
  PORT: Joi.number().port().default(5000),
  API_PREFIX: Joi.string().default('api/v1'),

  DATABASE_URL: Joi.string()
    .uri({ scheme: ['postgres', 'postgresql'] })
    .default('postgresql://postgres:postgres@localhost:5432/blih_core'),
  SKIP_DATABASE_CONNECT: Joi.boolean().default(false),
  DATABASE_POOL_SIZE: Joi.number().integer().min(1).default(10),
  DATABASE_TIMEOUT_MS: Joi.number().integer().min(1).default(5000),
  DATABASE_IDLE_TIMEOUT_MS: Joi.number().integer().min(1).default(300000),

  KEYCLOAK_ENABLED: Joi.boolean().default(true),
  KEYCLOAK_URL: Joi.string().uri().default('http://localhost:8080'),
  KEYCLOAK_REALM: Joi.string().default('blih'),
  KEYCLOAK_CLIENT_ID: Joi.string().default('blih-system-api'),
  KEYCLOAK_CLIENT_SECRET: Joi.string().allow('').default(''),
  KEYCLOAK_ADMIN_CLIENT_ID: Joi.string().default('admin-cli'),
  KEYCLOAK_ADMIN_USERNAME: Joi.string().allow('').default(''),
  KEYCLOAK_ADMIN_PASSWORD: Joi.string().allow('').default(''),
  TRUST_PROXY_PRINCIPAL_HEADERS: Joi.boolean().default(false),
  INTERNAL_AUTH_SHARED_SECRET: Joi.string().allow('').default(''),
  ENFORCE_MFA_FOR_PRIVILEGED: Joi.boolean().default(false),
  AUTH_POLICY_VERSION: Joi.string().default('1.0'),

  SMTP_ENABLED: Joi.boolean().default(false),
  SMTP_HOST: Joi.string().default('localhost'),
  SMTP_PORT: Joi.number().port().default(587),
  SMTP_SECURE: Joi.boolean().default(false),
  SMTP_USER: Joi.string().default('noreply@blih.local'),
  SMTP_PASSWORD: Joi.string().default('password'),
  EMAIL_FROM: Joi.string().default('BLIH <noreply@blih.local>'),

  SWAGGER_ENABLED: Joi.boolean().default(true),
  CORS_ORIGIN: Joi.string().default('*'),
  VERBOSE_REQUEST_LOGGING: Joi.boolean().default(false),

  AUDIT_RETENTION_DAYS: Joi.number().integer().min(30).default(2555),
  MAX_RETRY_ATTEMPTS: Joi.number().integer().min(1).default(3),
  RETRY_BACKOFF_MS: Joi.number().integer().min(100).default(1000),
  PRINCIPAL_CONTEXT_TTL_MS: Joi.number().integer().min(1000).default(30000),
  SYNC_ROLES_FROM_KEYCLOAK: Joi.boolean().default(false),

  JWT_EXPECTED_AUDIENCE: Joi.string().default('blih-system-api'),
  JWT_EXPECTED_ISSUER: Joi.string().allow('').default(''),
});

export type EnvValues = {
  NODE_ENV: string;
  API_HOST: string;
  PORT: number;
  API_PREFIX: string;
  DATABASE_URL: string;
  SKIP_DATABASE_CONNECT: boolean;
  DATABASE_POOL_SIZE: number;
  DATABASE_TIMEOUT_MS: number;
  DATABASE_IDLE_TIMEOUT_MS: number;
  KEYCLOAK_ENABLED: boolean;
  KEYCLOAK_URL: string;
  KEYCLOAK_REALM: string;
  KEYCLOAK_CLIENT_ID: string;
  KEYCLOAK_CLIENT_SECRET: string;
  KEYCLOAK_ADMIN_CLIENT_ID: string;
  KEYCLOAK_ADMIN_USERNAME: string;
  KEYCLOAK_ADMIN_PASSWORD: string;
  TRUST_PROXY_PRINCIPAL_HEADERS: boolean;
  INTERNAL_AUTH_SHARED_SECRET: string;
  ENFORCE_MFA_FOR_PRIVILEGED: boolean;
  AUTH_POLICY_VERSION: string;
  SMTP_ENABLED: boolean;
  SMTP_HOST: string;
  SMTP_PORT: number;
  SMTP_SECURE: boolean;
  SMTP_USER: string;
  SMTP_PASSWORD: string;
  EMAIL_FROM: string;
  SWAGGER_ENABLED: boolean;
  CORS_ORIGIN: string;
  VERBOSE_REQUEST_LOGGING: boolean;
  AUDIT_RETENTION_DAYS: number;
  MAX_RETRY_ATTEMPTS: number;
  RETRY_BACKOFF_MS: number;
  PRINCIPAL_CONTEXT_TTL_MS: number;
  SYNC_ROLES_FROM_KEYCLOAK: boolean;
  JWT_EXPECTED_AUDIENCE: string;
  JWT_EXPECTED_ISSUER: string;
};

const readRawEnv = () => ({
  NODE_ENV: process.env.NODE_ENV,
  API_HOST: process.env.API_HOST,
  PORT: process.env.PORT,
  API_PREFIX: process.env.API_PREFIX,
  DATABASE_URL: process.env.DATABASE_URL,
  SKIP_DATABASE_CONNECT: process.env.SKIP_DATABASE_CONNECT,
  DATABASE_POOL_SIZE: process.env.DATABASE_POOL_SIZE,
  DATABASE_TIMEOUT_MS: process.env.DATABASE_TIMEOUT_MS,
  DATABASE_IDLE_TIMEOUT_MS: process.env.DATABASE_IDLE_TIMEOUT_MS,
  KEYCLOAK_ENABLED: process.env.KEYCLOAK_ENABLED,
  KEYCLOAK_URL: process.env.KEYCLOAK_URL,
  KEYCLOAK_REALM: process.env.KEYCLOAK_REALM,
  KEYCLOAK_CLIENT_ID: process.env.KEYCLOAK_CLIENT_ID,
  KEYCLOAK_CLIENT_SECRET: process.env.KEYCLOAK_CLIENT_SECRET,
  KEYCLOAK_ADMIN_CLIENT_ID: process.env.KEYCLOAK_ADMIN_CLIENT_ID,
  KEYCLOAK_ADMIN_USERNAME: process.env.KEYCLOAK_ADMIN_USERNAME,
  KEYCLOAK_ADMIN_PASSWORD: process.env.KEYCLOAK_ADMIN_PASSWORD,
  TRUST_PROXY_PRINCIPAL_HEADERS: process.env.TRUST_PROXY_PRINCIPAL_HEADERS,
  INTERNAL_AUTH_SHARED_SECRET: process.env.INTERNAL_AUTH_SHARED_SECRET,
  ENFORCE_MFA_FOR_PRIVILEGED: process.env.ENFORCE_MFA_FOR_PRIVILEGED,
  AUTH_POLICY_VERSION: process.env.AUTH_POLICY_VERSION,
  SMTP_ENABLED: process.env.SMTP_ENABLED,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_SECURE: process.env.SMTP_SECURE,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD,
  EMAIL_FROM: process.env.EMAIL_FROM,
  SWAGGER_ENABLED: process.env.SWAGGER_ENABLED,
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  VERBOSE_REQUEST_LOGGING: process.env.VERBOSE_REQUEST_LOGGING,
  AUDIT_RETENTION_DAYS: process.env.AUDIT_RETENTION_DAYS,
  MAX_RETRY_ATTEMPTS: process.env.MAX_RETRY_ATTEMPTS,
  RETRY_BACKOFF_MS: process.env.RETRY_BACKOFF_MS,
  PRINCIPAL_CONTEXT_TTL_MS: process.env.PRINCIPAL_CONTEXT_TTL_MS,
  SYNC_ROLES_FROM_KEYCLOAK: process.env.SYNC_ROLES_FROM_KEYCLOAK,
  JWT_EXPECTED_AUDIENCE: process.env.JWT_EXPECTED_AUDIENCE,
  JWT_EXPECTED_ISSUER: process.env.JWT_EXPECTED_ISSUER,
});

let cachedEnv: EnvValues | null = null;

const resolveEnv = (): EnvValues => {
  if (cachedEnv) {
    return cachedEnv;
  }

  const result = envValidationSchema.validate(readRawEnv(), {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  });

  if (result.error) {
    throw new Error(`Env validation failed: ${result.error.message}`);
  }

  cachedEnv = result.value as EnvValues;
  return cachedEnv;
};

export const resetEnvCache = (): void => {
  cachedEnv = null;
};

export const env: EnvValues = new Proxy({} as EnvValues, {
  get(_target, property: string | symbol): unknown {
    const values = resolveEnv();
    if (typeof property === 'string' && property in values) {
      return values[property as keyof EnvValues];
    }
    return undefined;
  },
  ownKeys() {
    return Reflect.ownKeys(resolveEnv());
  },
  getOwnPropertyDescriptor(_target, property: string | symbol) {
    if (typeof property !== 'string') {
      return undefined;
    }
    const values = resolveEnv();
    if (!(property in values)) {
      return undefined;
    }
    return {
      configurable: true,
      enumerable: true,
      writable: false,
      value: values[property as keyof EnvValues],
    };
  },
});
