import { registerAs } from '@nestjs/config';

export interface RbacConfig {
  permissionDelimiter: string;
  wildcard: string;
}

export default registerAs(
  'rbac',
  (): RbacConfig => ({
    permissionDelimiter: ':',
    wildcard: '*',
  }),
);
