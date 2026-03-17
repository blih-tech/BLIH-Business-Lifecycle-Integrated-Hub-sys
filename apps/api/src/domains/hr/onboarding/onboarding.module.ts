import { Module } from '@nestjs/common';
import { AssetProvisioningModule } from './asset-provisioning/asset-provisioning.module';
import { OnboardingTasksModule } from './onboarding-tasks/onboarding-tasks.module';
import { OnboardingController } from './onboarding.controller';
import { PolicyAcknowledgementModule } from './policy-acknowledgement/policy-acknowledgement.module';
import { CreateOnboardingUseCase } from './create-onboarding.usecase';
import {
  GetOnboardingByIdUseCase,
  ListAllOnboardingUseCase,
  ListPaginatedOnboardingUseCase,
} from './query-onboarding.usecase';
import { UpdateOnboardingUseCase } from './update-onboarding.usecase';
import { DeleteOnboardingUseCase } from './delete-onboarding.usecase';

@Module({
  imports: [
    OnboardingTasksModule,
    AssetProvisioningModule,
    PolicyAcknowledgementModule,
  ],
  controllers: [OnboardingController],
  providers: [
    CreateOnboardingUseCase,
    UpdateOnboardingUseCase,
    DeleteOnboardingUseCase,
    ListAllOnboardingUseCase,
    ListPaginatedOnboardingUseCase,
    GetOnboardingByIdUseCase,
  ],
})
export class OnboardingModule {}
