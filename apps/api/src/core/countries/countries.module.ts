import { Module } from '@nestjs/common';
import { CountriesController } from './countries.controller';
import { PrismaModule } from '../../platform/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CountriesController],
})
export class CountriesModule {}
