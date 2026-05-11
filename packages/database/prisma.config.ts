import { config as loadEnv } from 'dotenv';
import { defineConfig } from 'prisma/config';

// Load envs for both package-local and monorepo API workflows.
loadEnv();
loadEnv({ path: '../../.env' });
loadEnv({ path: '../../apps/api/.env' });
loadEnv({ path: '../../apps/api/.env.local' });

const databaseUrl = process.env['DATABASE_URL'];
if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL is not set. Define it in root .env or apps/api/.env before running Prisma commands.',
  );
}

export default defineConfig({
  schema: 'schema',
  migrations: {
    path: 'migrations',
  },
  datasource: {
    url: databaseUrl,
    shadowDatabaseUrl: process.env['SHADOW_DATABASE_URL'],
  },
});
