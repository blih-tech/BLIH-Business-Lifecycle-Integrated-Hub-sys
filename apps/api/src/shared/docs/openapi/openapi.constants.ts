export const SWAGGER_BEARER_AUTH_NAME = 'access-token';
export const SWAGGER_COOKIE_AUTH_NAME = 'kc-access-cookie';

export const SWAGGER_DEFAULT_DOCS_PATH = 'api/docs';

/** Path to the OpenAPI JSON spec (exportable). e.g. GET /api/docs/openapi.json */
export const SWAGGER_JSON_SPEC_PATH = 'openapi.json';

/** Path to the OpenAPI YAML spec (exportable). e.g. GET /api/docs/openapi.yaml */
export const SWAGGER_YAML_SPEC_PATH = 'openapi.yaml';

export const SWAGGER_TAGS: ReadonlyArray<{
  name: string;
  description: string;
}> = [
  {
    name: 'Auth',
    description:
      'OIDC browser login/callback/logout plus token validation, introspection, refresh, and session APIs. kc_access is the primary browser auth cookie; kc_refresh is refresh-only; kc_id is optional.',
  },
  {
    name: 'Users',
    description: 'User lifecycle management and credential operations.',
  },
  {
    name: 'Positions',
    description: 'Position catalog CRUD for reusable job titles.',
  },
  {
    name: 'RBAC',
    description:
      'Role and permission management (2-part resource:action only), scoped assignment, and access evaluation.',
  },
  {
    name: 'Realms',
    description: 'Multi-tenant realm provisioning and governance.',
  },
  {
    name: 'System Config',
    description:
      'Platform configuration, module flags, and security policy APIs.',
  },
  {
    name: 'Notifications',
    description:
      'Multi-channel notification dispatch, inbox retrieval, and read-state updates.',
  },
  {
    name: 'Audit',
    description: 'Audit trail recording, querying, and export.',
  },
  {
    name: 'Health',
    description:
      'Service liveness/dependency checks for operations and monitoring.',
  },
];
