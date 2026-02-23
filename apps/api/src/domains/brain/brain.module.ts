import { Module } from '@nestjs/common';
import { BrainService } from './brain.service';
import { BrainController } from './brain.controller';

@Module({
  providers: [BrainService],
  controllers: [BrainController],
})
export class BrainModule {}
