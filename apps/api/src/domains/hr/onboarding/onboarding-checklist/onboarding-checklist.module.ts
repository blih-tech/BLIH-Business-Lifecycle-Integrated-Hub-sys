import { Module } from '@nestjs/common';
import { OnboardingChecklistController } from './onboarding-checklist.controller';
import { UpdateChecklistStatusUseCase } from './update-checklist-status.usecase';
import { EvaluateOnboardingUseCase } from './evaluate-onboarding.usecase';
import { OnboardingTaskExecutionController } from './execution.controller';

// Submit use cases
import { SubmitUserProfileUseCase } from './submit/submit-profile.usecase';
import { SubmitAddressUseCase } from './submit/submit-address.usecase';
import { SubmitBankDetailUseCase } from './submit/submit-bank-detail.usecase';
import { SubmitEmergencyContactUseCase } from './submit/submit-emergency-contact.usecase';
import { SubmitEducationUseCase } from './submit/submit-education.usecase';
import { SubmitContractUseCase } from './submit/submit-contract.usecase';
import { SubmitPolicyUseCase } from './submit/submit-policy.usecase';
import { SubmitDocumentUseCase } from './submit/submit-document.usecase';
import { SubmitCustomTaskUseCase } from './submit/submit-custom-task.usecase';

// Verify use cases
import { VerifyProfileUseCase } from './verify/verify-profile.usecase';
import { VerifyAddressUseCase } from './verify/verify-address.usecase';
import { VerifyBankDetailUseCase } from './verify/verify-bank-detail.usecase';
import { VerifyEmergencyContactUseCase } from './verify/verify-emergency-contact.usecase';
import { VerifyEducationUseCase } from './verify/verify-education.usecase';
import { VerifyContractUseCase } from './verify/verify-contract.usecase';
import { VerifyPolicyUseCase } from './verify/verify-policy.usecase';
import { VerifyDocumentUseCase } from './verify/verify-document.usecase';
import { VerifyCustomTaskUseCase } from './verify/verify-custom-task.usecase';

@Module({
  controllers: [
    OnboardingChecklistController,
    OnboardingTaskExecutionController,
  ],
  providers: [
    // Shared orchestration
    EvaluateOnboardingUseCase,
    UpdateChecklistStatusUseCase,
    // Phase 4 – Submit
    SubmitUserProfileUseCase,
    SubmitAddressUseCase,
    SubmitBankDetailUseCase,
    SubmitEmergencyContactUseCase,
    SubmitEducationUseCase,
    SubmitContractUseCase,
    SubmitPolicyUseCase,
    SubmitDocumentUseCase,
    SubmitCustomTaskUseCase,
    // Phase 5 – Verify
    VerifyProfileUseCase,
    VerifyAddressUseCase,
    VerifyBankDetailUseCase,
    VerifyEmergencyContactUseCase,
    VerifyEducationUseCase,
    VerifyContractUseCase,
    VerifyPolicyUseCase,
    VerifyDocumentUseCase,
    VerifyCustomTaskUseCase,
  ],
  exports: [EvaluateOnboardingUseCase],
})
export class OnboardingChecklistModule {}
