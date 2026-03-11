export * from './prisma-enums.generated';

export const Prisma = {
  JsonNull: null,
  DbNull: null,
} as const;

const createDelegate = () =>
  new Proxy(
    {},
    {
      get: () => async () => {
        throw new Error(
          'PrismaClient mock delegate called without a test-level stub.',
        );
      },
    },
  );

export class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get: (target, prop, receiver) => {
        if (prop in target) {
          return Reflect.get(target, prop, receiver);
        }
        return createDelegate();
      },
    });
  }

  async $connect(): Promise<void> {}

  async $disconnect(): Promise<void> {}

  async $transaction<T>(fn: (tx: PrismaClient) => Promise<T>): Promise<T>;
  async $transaction<T>(arg: T): Promise<T>;
  async $transaction<T>(
    arg: T | ((tx: PrismaClient) => Promise<T>),
  ): Promise<T> {
    if (typeof arg === 'function') {
      return (arg as (tx: PrismaClient) => Promise<T>)(this);
    }
    return arg;
  }
}
