import { Module } from '@nestjs/common';
import { OnboardingChecklistController } from './onboarding-checklist.controller';
import { UpdateChecklistStatusUseCase } from './update-checklist-status.usecase';

@Module({
  controllers: [OnboardingChecklistController],
  providers: [UpdateChecklistStatusUseCase],
})
export class OnboardingChecklistModule {}
