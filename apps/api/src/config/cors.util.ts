import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

function parseCorsOrigins(value: string): string[] {
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function buildCorsOptions(
  corsOriginValue: string,
  nodeEnv: string,
): CorsOptions {
  const normalized = corsOriginValue.trim();
  if (normalized === '*') {
    return {
      origin: nodeEnv === 'production' ? false : true,
      credentials: true,
    };
  }

  const allowedOrigins = new Set(parseCorsOrigins(normalized));
  return {
    credentials: true,
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('CORS origin not allowed'));
    },
  };
}
