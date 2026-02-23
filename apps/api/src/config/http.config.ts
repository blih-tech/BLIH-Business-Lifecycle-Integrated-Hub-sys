import { registerAs } from '@nestjs/config';
import { env } from './env.config';

export interface HttpConfig {
  apiPrefix: string;
  port: number;
  corsOrigin: string;
  swaggerEnabled: boolean;
}

export default registerAs(
  'http',
  (): HttpConfig => ({
    apiPrefix: env.API_PREFIX,
    port: env.PORT,
    corsOrigin: env.CORS_ORIGIN,
    swaggerEnabled: env.SWAGGER_ENABLED,
  }),
);
