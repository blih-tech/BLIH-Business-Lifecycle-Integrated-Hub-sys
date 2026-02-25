import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { env } from '../../config/env.config';

export const createPrismaPgAdapter = () => {
  const pool = new Pool({
    connectionString: env.DATABASE_URL,
    max: env.DATABASE_POOL_SIZE,
    connectionTimeoutMillis: env.DATABASE_TIMEOUT_MS,
    idleTimeoutMillis: env.DATABASE_IDLE_TIMEOUT_MS,
  });

  return {
    pool,
    adapter: new PrismaPg(pool),
  };
};
