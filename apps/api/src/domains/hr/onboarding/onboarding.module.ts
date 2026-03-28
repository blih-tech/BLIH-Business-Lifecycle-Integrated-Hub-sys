import { Module } from '@nestjs/common';
import { OnboardingTasksModule } from './onboarding-tasks/onboarding-tasks.module';
import { OnboardingController } from './onboarding.controller';
import { CreateOnboardingUseCase } from './create-onboarding.usecase';
import {
  GetOnboardingByIdUseCase,
  ListAllOnboardingUseCase,
  ListPaginatedOnboardingUseCase,
} from './query-onboarding.usecase';
import { UpdateOnboardingUseCase } from './update-onboarding.usecase';
import { DeleteOnboardingUseCase } from './delete-onboarding.usecase';
import { CancelOnboardingUseCase } from './cancel-onboarding.usecase';

import { OnboardingChecklistModule } from './onboarding-checklist/onboarding-checklist.module';

@Module({
  imports: [OnboardingChecklistModule, OnboardingTasksModule],
  controllers: [OnboardingController],
  providers: [
    CreateOnboardingUseCase,
    UpdateOnboardingUseCase,
    DeleteOnboardingUseCase,
    ListAllOnboardingUseCase,
    ListPaginatedOnboardingUseCase,
    GetOnboardingByIdUseCase,
    CancelOnboardingUseCase,
  ],
})
export class OnboardingModule {}
