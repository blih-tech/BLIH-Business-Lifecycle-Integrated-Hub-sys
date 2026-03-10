import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BrainService } from './brain.service';
import { BrainController } from './brain.controller';

@Module({
  imports: [HttpModule],
  providers: [BrainService],
  controllers: [BrainController],
})
export class BrainModule {}