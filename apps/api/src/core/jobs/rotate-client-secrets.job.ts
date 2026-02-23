import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class RotateClientSecretsJob {
  private readonly logger = new Logger(RotateClientSecretsJob.name);

  @Cron('0 0 3 * * *')
  run(): void {
    this.logger.log('Client secret rotation job triggered');
  }
}
