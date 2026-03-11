import { OnboardingTasksController } from './onboarding-tasks.controller';
import { Module } from '@nestjs/common';
import {
  GetOnboardingTaskByIdUseCase,
  ListAllOnboardingTasksUseCase,
  ListPaginatedOnboardingTasksUseCase,
} from './query-onboarding-tasks.usecase';
import { UpdateOnboardingTaskUseCase } from './update-onboarding-tasks.usecase';
import { CreateOnboardingTaskUseCase } from './create-onboarding-tasks.usecase';

@Module({
  controllers: [OnboardingTasksController],
  providers: [
    CreateOnboardingTaskUseCase,
    UpdateOnboardingTaskUseCase,
    ListAllOnboardingTasksUseCase,
    ListPaginatedOnboardingTasksUseCase,
    GetOnboardingTaskByIdUseCase,
  ],
})
export class OnboardingTasksModule {}
