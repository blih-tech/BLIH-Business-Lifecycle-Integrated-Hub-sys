import { createPrismaPgAdapter as createDatabasePrismaPgAdapter } from '@repo/database/prisma-adapter';
import { env } from '../../config/env.config';

export const createPrismaPgAdapter = () =>
  createDatabasePrismaPgAdapter({
    connectionString: env.DATABASE_URL,
    max: env.DATABASE_POOL_SIZE,
    connectionTimeoutMillis: env.DATABASE_TIMEOUT_MS,
    idleTimeoutMillis: env.DATABASE_IDLE_TIMEOUT_MS,
  });
