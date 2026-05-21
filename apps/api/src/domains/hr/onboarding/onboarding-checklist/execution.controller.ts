import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { Roles } from '../../../../shared/decorators/roles.decorator';
import { KeycloakAuthGuard } from '../../../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../../../shared/guards/rbac.guard';
import { OnboardingPermissions } from '@repo/types/rbac';

// Docs decorators
import {
  ApiSubmitProfileTask,
  ApiSubmitAddressTask,
  ApiSubmitBankDetailTask,
  ApiSubmitEmergencyContactTask,
  ApiSubmitEducationTask,
  ApiSubmitContractTask,
  ApiSubmitPolicyTask,
  ApiSubmitDocumentTask,
  ApiMarkCustomTaskDone,
  ApiVerifyProfileTask,
  ApiVerifyAddressTask,
  ApiVerifyBankDetailTask,
  ApiVerifyEmergencyContactTask,
  ApiVerifyEducationTask,
  ApiVerifyContractTask,
  ApiVerifyPolicyTask,
  ApiVerifyDocumentTask,
  ApiVerifyCustomTask,
  ApiOnboardingChecklistTag,
} from './onboarding-checklist.docs';

// Submit DTOs
import {
  SubmitAddressTaskDto,
  SubmitBankDetailTaskDto,
  SubmitContractTaskDto,
  SubmitDocumentTaskDto,
  SubmitEducationTaskDto,
  SubmitEmergencyContactTaskDto,
  SubmitPolicyTaskDto,
  SubmitUserProfileDto,
} from './submit/execution.dto';

// Submit use cases
import { SubmitAddressUseCase } from './submit/submit-address.usecase';
import { SubmitBankDetailUseCase } from './submit/submit-bank-detail.usecase';
import { SubmitContractUseCase } from './submit/submit-contract.usecase';
import { SubmitCustomTaskUseCase } from './submit/submit-custom-task.usecase';
import { SubmitDocumentUseCase } from './submit/submit-document.usecase';
import { SubmitEducationUseCase } from './submit/submit-education.usecase';
import { SubmitEmergencyContactUseCase } from './submit/submit-emergency-contact.usecase';
import { SubmitPolicyUseCase } from './submit/submit-policy.usecase';
import { SubmitUserProfileUseCase } from './submit/submit-profile.usecase';

// Verify DTO + use cases
import { VerifyPayloadDto } from './verify/verify-payload.dto';
import { VerifyAddressUseCase } from './verify/verify-address.usecase';
import { VerifyBankDetailUseCase } from './verify/verify-bank-detail.usecase';
import { VerifyContractUseCase } from './verify/verify-contract.usecase';
import { VerifyCustomTaskUseCase } from './verify/verify-custom-task.usecase';
import { VerifyDocumentUseCase } from './verify/verify-document.usecase';
import { VerifyEducationUseCase } from './verify/verify-education.usecase';
import { VerifyEmergencyContactUseCase } from './verify/verify-emergency-contact.usecase';
import { VerifyPolicyUseCase } from './verify/verify-policy.usecase';
import { VerifyProfileUseCase } from './verify/verify-profile.usecase';

/** Extracts the authenticated HR user's ID from the Keycloak JWT token. */
function getHrUserId(req: Request): string {
  const user = (req as unknown as Record<string, unknown>)['user'] as
    | Record<string, unknown>
    | undefined;
  return (user?.['sub'] as string) ?? 'unknown';
}

@ApiOnboardingChecklistTag()
@Controller('hr/onboarding/tasks')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class OnboardingTaskExecutionController {
  constructor(
    // Submit
    private readonly submitProfile: SubmitUserProfileUseCase,
    private readonly submitAddress: SubmitAddressUseCase,
    private readonly submitBankDetail: SubmitBankDetailUseCase,
    private readonly submitEmergencyContact: SubmitEmergencyContactUseCase,
    private readonly submitEducation: SubmitEducationUseCase,
    private readonly submitContract: SubmitContractUseCase,
    private readonly submitPolicy: SubmitPolicyUseCase,
    private readonly submitDocument: SubmitDocumentUseCase,
    private readonly submitCustomTask: SubmitCustomTaskUseCase,
    // Verify
    private readonly verifyProfile: VerifyProfileUseCase,
    private readonly verifyAddress: VerifyAddressUseCase,
    private readonly verifyBankDetail: VerifyBankDetailUseCase,
    private readonly verifyEmergencyContact: VerifyEmergencyContactUseCase,
    private readonly verifyEducation: VerifyEducationUseCase,
    private readonly verifyContract: VerifyContractUseCase,
    private readonly verifyPolicy: VerifyPolicyUseCase,
    private readonly verifyDocument: VerifyDocumentUseCase,
    private readonly verifyCustomTask: VerifyCustomTaskUseCase,
  ) {}

  // ─── Phase 4: Submit Endpoints (Employee) ────────────────────────────────────

  @Post(':taskId/profile')
  @Roles(OnboardingPermissions.UPDATE)
  @ApiSubmitProfileTask()
  submitProfileTask(
    @Param('taskId') taskId: string,
    @Body() body: SubmitUserProfileDto,
  ) {
    return this.submitProfile.execute(taskId, body);
  }

  @Post(':taskId/address')
  @Roles(OnboardingPermissions.UPDATE)
  @ApiSubmitAddressTask()
  submitAddressTask(
    @Param('taskId') taskId: string,
    @Body() body: SubmitAddressTaskDto,
  ) {
    return this.submitAddress.execute(taskId, body);
  }

  @Post(':taskId/bank-detail')
  @Roles(OnboardingPermissions.UPDATE)
  @ApiSubmitBankDetailTask()
  submitBankDetailTask(
    @Param('taskId') taskId: string,
    @Body() body: SubmitBankDetailTaskDto,
  ) {
    return this.submitBankDetail.execute(taskId, body);
  }

  @Post(':taskId/emergency-contact')
  @Roles(OnboardingPermissions.UPDATE)
  @ApiSubmitEmergencyContactTask()
  submitEmergencyContactTask(
    @Param('taskId') taskId: string,
    @Body() body: SubmitEmergencyContactTaskDto,
  ) {
    return this.submitEmergencyContact.execute(taskId, body);
  }

  @Post(':taskId/education')
  @Roles(OnboardingPermissions.UPDATE)
  @ApiSubmitEducationTask()
  submitEducationTask(
    @Param('taskId') taskId: string,
    @Body() body: SubmitEducationTaskDto,
  ) {
    return this.submitEducation.execute(taskId, body);
  }

  @Post(':taskId/contract')
  @Roles(OnboardingPermissions.UPDATE)
  @ApiSubmitContractTask()
  submitContractTask(
    @Param('taskId') taskId: string,
    @Body() body: SubmitContractTaskDto,
  ) {
    return this.submitContract.execute(taskId, body);
  }

  @Post(':taskId/policy')
  @Roles(OnboardingPermissions.UPDATE)
  @ApiSubmitPolicyTask()
  submitPolicyTask(
    @Param('taskId') taskId: string,
    @Body() body: SubmitPolicyTaskDto,
  ) {
    return this.submitPolicy.execute(taskId, body);
  }

  @Post(':taskId/document')
  @Roles(OnboardingPermissions.UPDATE)
  @ApiSubmitDocumentTask()
  submitDocumentTask(
    @Param('taskId') taskId: string,
    @Body() body: SubmitDocumentTaskDto,
  ) {
    return this.submitDocument.execute(taskId, body);
  }

  /** Employee marks CUSTOM task done → COMPLETED or SUBMITTED (if HR verify required) */
  @Post(':taskId/done')
  @Roles(OnboardingPermissions.UPDATE)
  @ApiMarkCustomTaskDone()
  markCustomDone(@Param('taskId') taskId: string) {
    return this.submitCustomTask.execute(taskId);
  }

  // ─── Phase 5: Verify Endpoints (HR) ──────────────────────────────────────────

  @Post(':taskId/profile/verify')
  @Roles(OnboardingPermissions.VERIFY)
  @ApiVerifyProfileTask()
  verifyProfileTask(
    @Param('taskId') taskId: string,
    @Body() body: VerifyPayloadDto,
    @Req() req: Request,
  ) {
    return this.verifyProfile.execute(taskId, getHrUserId(req), body);
  }

  @Post(':taskId/address/verify')
  @Roles(OnboardingPermissions.VERIFY)
  @ApiVerifyAddressTask()
  verifyAddressTask(
    @Param('taskId') taskId: string,
    @Body() body: VerifyPayloadDto,
    @Req() req: Request,
  ) {
    return this.verifyAddress.execute(taskId, getHrUserId(req), body);
  }

  @Post(':taskId/bank-detail/verify')
  @Roles(OnboardingPermissions.VERIFY)
  @ApiVerifyBankDetailTask()
  verifyBankDetailTask(
    @Param('taskId') taskId: string,
    @Body() body: VerifyPayloadDto,
    @Req() req: Request,
  ) {
    return this.verifyBankDetail.execute(taskId, getHrUserId(req), body);
  }

  @Post(':taskId/emergency-contact/verify')
  @Roles(OnboardingPermissions.VERIFY)
  @ApiVerifyEmergencyContactTask()
  verifyEmergencyContactTask(
    @Param('taskId') taskId: string,
    @Body() body: VerifyPayloadDto,
    @Req() req: Request,
  ) {
    return this.verifyEmergencyContact.execute(taskId, getHrUserId(req), body);
  }

  @Post(':taskId/education/verify')
  @Roles(OnboardingPermissions.VERIFY)
  @ApiVerifyEducationTask()
  verifyEducationTask(
    @Param('taskId') taskId: string,
    @Body() body: VerifyPayloadDto,
    @Req() req: Request,
  ) {
    return this.verifyEducation.execute(taskId, getHrUserId(req), body);
  }

  @Post(':taskId/contract/verify')
  @Roles(OnboardingPermissions.VERIFY)
  @ApiVerifyContractTask()
  verifyContractTask(
    @Param('taskId') taskId: string,
    @Body() body: VerifyPayloadDto,
    @Req() req: Request,
  ) {
    return this.verifyContract.execute(taskId, getHrUserId(req), body);
  }

  @Post(':taskId/policy/verify')
  @Roles(OnboardingPermissions.VERIFY)
  @ApiVerifyPolicyTask()
  verifyPolicyTask(
    @Param('taskId') taskId: string,
    @Body() body: VerifyPayloadDto,
    @Req() req: Request,
  ) {
    return this.verifyPolicy.execute(taskId, getHrUserId(req), body);
  }

  @Post(':taskId/document/verify')
  @Roles(OnboardingPermissions.VERIFY)
  @ApiVerifyDocumentTask()
  verifyDocumentTask(
    @Param('taskId') taskId: string,
    @Body() body: VerifyPayloadDto,
    @Req() req: Request,
  ) {
    return this.verifyDocument.execute(taskId, getHrUserId(req), body);
  }

  /** HR approves or rejects a CUSTOM task that was submitted for review */
  @Post(':taskId/done/verify')
  @Roles(OnboardingPermissions.VERIFY)
  @ApiVerifyCustomTask()
  verifyCustomTaskRoute(
    @Param('taskId') taskId: string,
    @Body() body: VerifyPayloadDto,
    @Req() req: Request,
  ) {
    return this.verifyCustomTask.execute(taskId, getHrUserId(req), body);
  }
}
