import {
  INestApplication,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import type { Pool } from 'pg';
import { env } from '../../config/env.config';
import { createPrismaPgAdapter } from './prisma.adapter';
import { PrismaClient } from './prisma-client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly pool: Pool;

  constructor() {
    const { adapter, pool } = createPrismaPgAdapter();
    super({ adapter });
    this.pool = pool;
  }

  async onModuleInit(): Promise<void> {
    if (env.NODE_ENV === 'test' || env.SKIP_DATABASE_CONNECT) {
      return;
    }
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    await this.pool.end();
  }

  enableShutdownHooks(app: INestApplication): void {
    void app;
  }
}
