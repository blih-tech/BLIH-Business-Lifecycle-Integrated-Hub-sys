import { PrismaClient as PrismaClientCtor } from './generated/client.js';
import type { PrismaClient as PrismaClientInstance } from './generated/client.js';

export { Prisma } from './generated/client.js';
export * from './generated/enums.js';

export class PrismaClient extends (PrismaClientCtor as unknown as {
  new (...args: ConstructorParameters<typeof PrismaClientCtor>): PrismaClientInstance;
}) {}
