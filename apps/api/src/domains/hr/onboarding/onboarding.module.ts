import { Module } from '@nestjs/common';
import { OnboardingTasksModule } from './on-boarding-tasks/on-boarding-tasks.module';

@Module({
  imports: [OnboardingTasksModule],
})
export class OnboardingModule {}
