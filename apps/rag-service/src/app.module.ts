import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // 1. Import this
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RagModule } from './rag/rag.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    RagModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}