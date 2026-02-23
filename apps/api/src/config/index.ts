import { envValidationSchema } from './env.config';
import keycloakConfig from './keycloak.config';
import rbacConfig from './rbac.config';
import auditConfig from './audit.config';
import notificationConfig from './notification.config';
import httpConfig from './http.config';

export const configLoaders = [
  keycloakConfig,
  rbacConfig,
  auditConfig,
  notificationConfig,
  httpConfig,
];

export { envValidationSchema };
export {
  keycloakConfig,
  rbacConfig,
  auditConfig,
  notificationConfig,
  httpConfig,
};
