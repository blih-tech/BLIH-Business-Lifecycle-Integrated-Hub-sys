import { config as loadEnv } from 'dotenv';
import { defineConfig } from 'prisma/config';

// Load envs for both package-local and monorepo API workflows.
loadEnv();
loadEnv({ path: '../../.env' });
loadEnv({ path: '../../apps/api/.env' });
loadEnv({ path: '../../apps/api/.env.local' });
loadEnv({ path: '../../apps/api/.env.production' });

/**
 * `prisma generate` does not open a DB connection; Prisma still requires a URL in config.
 * Matches `apps/api/.env.example` (local / docker-style Postgres) for provider and URL shape.
 */
const DATABASE_URL_FOR_GENERATE_ONLY =
  'postgresql://postgres:admin1234@localhost:5432/blih-system';

function isPrismaGenerateCli(): boolean {
  const argv = process.argv;
  return (
    argv.includes('generate') &&
    argv.some((arg) => arg.replaceAll('\\', '/').includes('/prisma/'))
  );
}

const fromEnv = process.env['DATABASE_URL']?.trim();
const databaseUrl =
  fromEnv ||
  (process.env['CI'] === 'true' || isPrismaGenerateCli()
    ? DATABASE_URL_FOR_GENERATE_ONLY
    : undefined);

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
