import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { env } from '../../config/env.config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    if (env.NODE_ENV === 'test' || env.SKIP_DATABASE_CONNECT) {
      return;
    }
    await this.$connect();
  }

  enableShutdownHooks(app: INestApplication): void {
    void app;
  }
}
