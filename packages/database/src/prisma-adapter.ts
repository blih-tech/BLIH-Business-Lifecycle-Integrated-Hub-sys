import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

export interface PrismaPgAdapterConfig {
  connectionString: string;
  max?: number;
  connectionTimeoutMillis?: number;
  idleTimeoutMillis?: number;
}

export const createPrismaPgAdapter = (config: PrismaPgAdapterConfig) => {
  const pool = new Pool({
    connectionString: config.connectionString,
    max: config.max,
    connectionTimeoutMillis: config.connectionTimeoutMillis,
    idleTimeoutMillis: config.idleTimeoutMillis,
  });

  return {
    pool,
    adapter: new PrismaPg(pool),
  };
};
