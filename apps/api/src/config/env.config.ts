import * as Joi from 'joi';

const createEnvValidationSchema = () =>
  Joi.object({
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
    KEYCLOAK_INTERNAL_URL: Joi.string().uri().allow('').default(''),
    KEYCLOAK_REALM: Joi.string().default('blih'),
    KEYCLOAK_CLIENT_ID: Joi.string().default('blih-system-api'),
    KEYCLOAK_CLIENT_SECRET: Joi.string().allow('').default(''),
    KEYCLOAK_AUTH_CLIENT_ID: Joi.string().default('blih-system-auth'),
    KEYCLOAK_AUTH_CLIENT_SECRET: Joi.string().allow('').default(''),
    KEYCLOAK_AUTHORIZATION_URL: Joi.string().uri().allow('').default(''),
    KEYCLOAK_TOKEN_URL: Joi.string().uri().allow('').default(''),
    KEYCLOAK_LOGOUT_URL: Joi.string().uri().allow('').default(''),
    KEYCLOAK_USERINFO_URL: Joi.string().uri().allow('').default(''),
    KEYCLOAK_JWKS_URL: Joi.string().uri().allow('').default(''),
    KEYCLOAK_AUTH_REDIRECT_URI: Joi.string()
      .uri()
      .default('http://localhost:5000/api/v1/auth/callback'),
    KEYCLOAK_AUTH_SCOPES: Joi.string().default('openid profile email'),
    KEYCLOAK_ADMIN_CLIENT_ID: Joi.string().default('admin-cli'),
    KEYCLOAK_ADMIN_USERNAME: Joi.string().allow('').default(''),
    KEYCLOAK_ADMIN_PASSWORD: Joi.string().allow('').default(''),
    TRUST_PROXY_PRINCIPAL_HEADERS: Joi.boolean().default(false),
    INTERNAL_AUTH_SHARED_SECRET: Joi.string().allow('').default(''),
    ENFORCE_MFA_FOR_PRIVILEGED: Joi.boolean().default(false),
    AUTH_POLICY_VERSION: Joi.string().default('1.0'),
    AUTH_FRONTEND_BASE_URL: Joi.string().uri().default('http://localhost:3000'),
    AUTH_ALLOWED_REDIRECT_PATH_PREFIXES: Joi.string().default(
      '/,/auth,/dashboard,/no-access',
    ),
    AUTH_LOGIN_ERROR_REDIRECT_URI: Joi.string().default('/no-access'),
    AUTH_POST_LOGIN_REDIRECT_URI: Joi.string().default('/dashboard'),
    AUTH_POST_LOGOUT_REDIRECT_URI: Joi.string().default('/dashboard'),
    AUTH_STATE_TTL_SECONDS: Joi.number().integer().min(60).default(600),
    AUTH_REFRESH_TOKEN_TTL_SECONDS: Joi.number()
      .integer()
      .min(60)
      .default(2592000),
    AUTH_COOKIE_HTTP_ONLY: Joi.boolean().default(true),
    AUTH_COOKIE_SECURE: Joi.boolean().when('NODE_ENV', {
      is: 'production',
      then: Joi.boolean().default(true),
      otherwise: Joi.boolean().default(false),
    }),
    AUTH_COOKIE_DOMAIN: Joi.string().allow('').default(''),
    AUTH_COOKIE_PATH: Joi.string().default('/'),
    AUTH_COOKIE_SAME_SITE: Joi.string()
      .valid('lax', 'strict', 'none')
      .default('lax'),
    AUTH_NONCE_ENABLED: Joi.boolean().default(true),
    AUTH_PKCE_ENABLED: Joi.boolean().default(true),
    AUTH_PKCE_METHOD: Joi.string().valid('S256').default('S256'),
    AUTH_LOGIN_RATE_LIMIT_POINTS: Joi.number().integer().min(1).default(10),
    AUTH_LOGIN_RATE_LIMIT_WINDOW_SECONDS: Joi.number()
      .integer()
      .min(1)
      .default(60),
    JWKS_CACHE_TTL_SECONDS: Joi.number().integer().min(60).default(3600),
    JWKS_CACHE_MAX_KEYS: Joi.number().integer().min(1).default(5),

    SMTP_ENABLED: Joi.boolean().default(false),
    SMTP_HOST: Joi.string().default('localhost'),
    SMTP_PORT: Joi.number().port().default(587),
    SMTP_SECURE: Joi.boolean().default(false),
    SMTP_USER: Joi.string().default('noreply@blih.local'),
    SMTP_PASSWORD: Joi.string().default('password'),
    EMAIL_FROM: Joi.string().default('BLIH <noreply@blih.local>'),

    SWAGGER_ENABLED: Joi.boolean().default(true),
    CORS_ORIGIN: Joi.when('NODE_ENV', {
      is: 'production',
      then: Joi.string().invalid('*').required(),
      otherwise: Joi.string().default('*'),
    }),
    VERBOSE_REQUEST_LOGGING: Joi.boolean().default(false),

    AUDIT_RETENTION_DAYS: Joi.number().integer().min(30).default(2555),
    MAX_RETRY_ATTEMPTS: Joi.number().integer().min(1).default(3),
    RETRY_BACKOFF_MS: Joi.number().integer().min(100).default(1000),
    PRINCIPAL_CONTEXT_TTL_MS: Joi.number().integer().min(1000).default(30000),
    SYNC_ROLES_FROM_KEYCLOAK: Joi.boolean().default(false),

    JWT_EXPECTED_AUDIENCE: Joi.string().default('blih-system-api'),
    JWT_EXPECTED_ISSUER: Joi.string().allow('').default(''),
  }).custom((value, helpers) => {
    if (value.NODE_ENV !== 'production') {
      return value;
    }

    const authRedirectUri = new URL(value.KEYCLOAK_AUTH_REDIRECT_URI);
    const frontendBaseUrl = new URL(value.AUTH_FRONTEND_BASE_URL);

    if (!value.AUTH_COOKIE_SECURE) {
      return helpers.error('any.custom', {
        message: 'AUTH_COOKIE_SECURE must be true when NODE_ENV=production.',
      });
    }

    if (authRedirectUri.protocol !== 'https:') {
      return helpers.error('any.custom', {
        message: 'KEYCLOAK_AUTH_REDIRECT_URI must use https in production.',
      });
    }

    if (frontendBaseUrl.protocol !== 'https:') {
      return helpers.error('any.custom', {
        message: 'AUTH_FRONTEND_BASE_URL must use https in production.',
      });
    }

    if (
      value.AUTH_COOKIE_SAME_SITE === 'none' &&
      value.AUTH_COOKIE_SECURE !== true
    ) {
      return helpers.error('any.custom', {
        message: 'AUTH_COOKIE_SAME_SITE=none requires AUTH_COOKIE_SECURE=true.',
      });
    }

    return value;
  });
export const envValidationSchema = createEnvValidationSchema().messages({
  'any.custom': '{{#message}}',
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
  KEYCLOAK_AUTH_CLIENT_ID: string;
  KEYCLOAK_AUTH_CLIENT_SECRET: string;
  KEYCLOAK_AUTHORIZATION_URL: string;
  KEYCLOAK_TOKEN_URL: string;
  KEYCLOAK_LOGOUT_URL: string;
  KEYCLOAK_USERINFO_URL: string;
  KEYCLOAK_JWKS_URL: string;
  KEYCLOAK_AUTH_REDIRECT_URI: string;
  KEYCLOAK_AUTH_SCOPES: string;
  KEYCLOAK_ADMIN_CLIENT_ID: string;
  KEYCLOAK_ADMIN_USERNAME: string;
  KEYCLOAK_ADMIN_PASSWORD: string;
  TRUST_PROXY_PRINCIPAL_HEADERS: boolean;
  INTERNAL_AUTH_SHARED_SECRET: string;
  ENFORCE_MFA_FOR_PRIVILEGED: boolean;
  AUTH_POLICY_VERSION: string;
  AUTH_FRONTEND_BASE_URL: string;
  AUTH_ALLOWED_REDIRECT_PATH_PREFIXES: string;
  AUTH_LOGIN_ERROR_REDIRECT_URI: string;
  AUTH_POST_LOGIN_REDIRECT_URI: string;
  AUTH_POST_LOGOUT_REDIRECT_URI: string;
  AUTH_STATE_TTL_SECONDS: number;
  AUTH_REFRESH_TOKEN_TTL_SECONDS: number;
  AUTH_COOKIE_HTTP_ONLY: boolean;
  AUTH_COOKIE_SECURE: boolean;
  AUTH_COOKIE_DOMAIN: string;
  AUTH_COOKIE_PATH: string;
  AUTH_COOKIE_SAME_SITE: 'lax' | 'strict' | 'none';
  AUTH_NONCE_ENABLED: boolean;
  AUTH_PKCE_ENABLED: boolean;
  AUTH_PKCE_METHOD: 'S256';
  AUTH_LOGIN_RATE_LIMIT_POINTS: number;
  AUTH_LOGIN_RATE_LIMIT_WINDOW_SECONDS: number;
  JWKS_CACHE_TTL_SECONDS: number;
  JWKS_CACHE_MAX_KEYS: number;
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
  KEYCLOAK_AUTH_CLIENT_ID: process.env.KEYCLOAK_AUTH_CLIENT_ID,
  KEYCLOAK_AUTH_CLIENT_SECRET: process.env.KEYCLOAK_AUTH_CLIENT_SECRET,
  KEYCLOAK_AUTHORIZATION_URL: process.env.KEYCLOAK_AUTHORIZATION_URL,
  KEYCLOAK_TOKEN_URL: process.env.KEYCLOAK_TOKEN_URL,
  KEYCLOAK_LOGOUT_URL: process.env.KEYCLOAK_LOGOUT_URL,
  KEYCLOAK_USERINFO_URL: process.env.KEYCLOAK_USERINFO_URL,
  KEYCLOAK_JWKS_URL: process.env.KEYCLOAK_JWKS_URL,
  KEYCLOAK_AUTH_REDIRECT_URI: process.env.KEYCLOAK_AUTH_REDIRECT_URI,
  KEYCLOAK_AUTH_SCOPES: process.env.KEYCLOAK_AUTH_SCOPES,
  KEYCLOAK_ADMIN_CLIENT_ID: process.env.KEYCLOAK_ADMIN_CLIENT_ID,
  KEYCLOAK_ADMIN_USERNAME: process.env.KEYCLOAK_ADMIN_USERNAME,
  KEYCLOAK_ADMIN_PASSWORD: process.env.KEYCLOAK_ADMIN_PASSWORD,
  TRUST_PROXY_PRINCIPAL_HEADERS: process.env.TRUST_PROXY_PRINCIPAL_HEADERS,
  INTERNAL_AUTH_SHARED_SECRET: process.env.INTERNAL_AUTH_SHARED_SECRET,
  ENFORCE_MFA_FOR_PRIVILEGED: process.env.ENFORCE_MFA_FOR_PRIVILEGED,
  AUTH_POLICY_VERSION: process.env.AUTH_POLICY_VERSION,
  AUTH_FRONTEND_BASE_URL: process.env.AUTH_FRONTEND_BASE_URL,
  AUTH_ALLOWED_REDIRECT_PATH_PREFIXES:
    process.env.AUTH_ALLOWED_REDIRECT_PATH_PREFIXES,
  AUTH_LOGIN_ERROR_REDIRECT_URI: process.env.AUTH_LOGIN_ERROR_REDIRECT_URI,
  AUTH_POST_LOGIN_REDIRECT_URI: process.env.AUTH_POST_LOGIN_REDIRECT_URI,
  AUTH_POST_LOGOUT_REDIRECT_URI: process.env.AUTH_POST_LOGOUT_REDIRECT_URI,
  AUTH_STATE_TTL_SECONDS: process.env.AUTH_STATE_TTL_SECONDS,
  AUTH_REFRESH_TOKEN_TTL_SECONDS: process.env.AUTH_REFRESH_TOKEN_TTL_SECONDS,
  AUTH_COOKIE_HTTP_ONLY: process.env.AUTH_COOKIE_HTTP_ONLY,
  AUTH_COOKIE_SECURE: process.env.AUTH_COOKIE_SECURE,
  AUTH_COOKIE_DOMAIN: process.env.AUTH_COOKIE_DOMAIN,
  AUTH_COOKIE_PATH: process.env.AUTH_COOKIE_PATH,
  AUTH_COOKIE_SAME_SITE: process.env.AUTH_COOKIE_SAME_SITE,
  AUTH_NONCE_ENABLED: process.env.AUTH_NONCE_ENABLED,
  AUTH_PKCE_ENABLED: process.env.AUTH_PKCE_ENABLED,
  AUTH_PKCE_METHOD: process.env.AUTH_PKCE_METHOD,
  AUTH_LOGIN_RATE_LIMIT_POINTS: process.env.AUTH_LOGIN_RATE_LIMIT_POINTS,
  AUTH_LOGIN_RATE_LIMIT_WINDOW_SECONDS:
    process.env.AUTH_LOGIN_RATE_LIMIT_WINDOW_SECONDS,
  JWKS_CACHE_TTL_SECONDS: process.env.JWKS_CACHE_TTL_SECONDS,
  JWKS_CACHE_MAX_KEYS: process.env.JWKS_CACHE_MAX_KEYS,
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
