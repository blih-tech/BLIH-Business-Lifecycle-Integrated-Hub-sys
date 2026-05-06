import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import {
  ApiDefaultErrors,
  ApiEnvelopeOkResponse,
  ApiProtected,
} from '../../../../shared/docs/openapi';
import { OnboardingPermissions } from '@repo/types/rbac';
import { OnboardingChecklistResponseDto } from '../onboarding.dto';
import { UpdateChecklistStatusDto } from './onboarding-checklist.dto';
import { VerifyPayloadDto } from './verify/verify-payload.dto';
import {
  SubmitAddressTaskDto,
  SubmitBankDetailTaskDto,
  SubmitContractTaskDto,
  SubmitEducationTaskDto,
  SubmitEmergencyContactTaskDto,
  SubmitPolicyTaskDto,
  SubmitUserProfileDto,
} from './submit/execution.dto';

// ─── Tag helpers ─────────────────────────────────────────────────────────────

export function ApiOnboardingChecklistTag() {
  return applyDecorators(ApiTags('HR Onboarding Checklist'));
}

// ─── Legacy: direct status patch ─────────────────────────────────────────────

export function ApiUpdateChecklistStatus() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update onboarding checklist item status (admin override)',
      description:
        'Directly sets `status` or `dueDate` on a checklist item. ' +
        'Prefer the typed submit/verify endpoints for normal employee/HR flows.',
    }),
    ApiParam({ name: 'id', description: 'OnboardingChecklist UUID' }),
    ApiBody({
      type: UpdateChecklistStatusDto,
      description: 'New status or due-date override.',
      examples: {
        todo: { summary: 'Reset to TODO', value: { status: 'TODO' } },
        submitted: {
          summary: 'Mark submitted',
          value: { status: 'SUBMITTED' },
        },
      },
    }),
    ApiProtected({
      path: '/api/v1/hr/onboarding/checklists/:id/status',
      roles: [OnboardingPermissions.UPDATE],
    }),
    ApiEnvelopeOkResponse(
      OnboardingChecklistResponseDto,
      'Checklist status updated successfully',
      {
        success: true,
        message: 'Checklist status updated successfully',
        data: {
          id: 'checklist-uuid-1',
          taskInstanceId: 'task-inst-uuid-1',
          onboardingId: 'onboarding-uuid-1',
          status: 'SUBMITTED',
          dueDate: null,
          createdAt: '2026-03-11T08:00:00.000Z',
          updatedAt: '2026-03-11T14:00:00.000Z',
        },
        error: null,
        meta: {
          timestamp: '2026-03-11T14:00:00.000Z',
          requestId: 'req_01HZ_CHECKLIST_STATUS_EXAMPLE',
          version: 'v1',
        },
      },
    ),
    ApiDefaultErrors({
      path: '/api/v1/hr/onboarding/checklists/:id/status',
      badRequest: 'Payload is invalid',
      notFound: 'Checklist item not found',
      unauthorized: 'Unauthorized: missing or invalid bearer access token',
      forbidden: 'Required roles are missing',
    }),
  );
}

// ─── Shared verify decorator factory ─────────────────────────────────────────

function buildVerifyDecorator(model: string, pathSlug: string) {
  const path = `/api/v1/hr/onboarding/tasks/:taskId/${pathSlug}/verify`;
  return applyDecorators(
    ApiOperation({
      summary: `HR: verify ${model} task`,
      description:
        `Reviews a **SUBMITTED** \`${model}\` checklist item.\n\n` +
        `- **Approve** → target record set to \`VERIFIED\`, checklist → \`COMPLETED\`.\n` +
        `- **Reject**  → target record set to \`REJECTED\`, checklist → \`CHANGES_REQUESTED\`.`,
    }),
    ApiParam({ name: 'taskId', description: 'OnboardingTaskInstance UUID' }),
    ApiBody({
      type: VerifyPayloadDto,
      examples: {
        approve: { summary: 'Approve', value: { approved: true } },
        reject: {
          summary: 'Reject with feedback',
          value: {
            approved: false,
            hrFeedback: 'Address details are incomplete.',
          },
        },
      },
    }),
    ApiProtected({ path, roles: [OnboardingPermissions.VERIFY] }),
    ApiDefaultErrors({
      path,
      badRequest: 'Task is not in SUBMITTED state or wrong task type',
      notFound: 'Task instance not found in checklist',
      unauthorized: 'Unauthorized: missing or invalid bearer access token',
      forbidden: 'Required roles are missing',
    }),
  );
}

// ─── Phase 4: Submit – typed endpoint decorators ──────────────────────────────

export function ApiSubmitProfileTask() {
  const path = '/api/v1/hr/onboarding/tasks/:taskId/profile';
  return applyDecorators(
    ApiOperation({
      summary: 'Employee: submit user profile data',
      description:
        'Upserts `UserProfile` with `status: PENDING_REVIEW`. ' +
        'Checklist transitions to `SUBMITTED` (or `COMPLETED` if no HR verify required).',
    }),
    ApiParam({ name: 'taskId', description: 'OnboardingTaskInstance UUID' }),
    ApiBody({
      type: SubmitUserProfileDto,
      examples: {
        profile: {
          summary: 'Basic profile submission',
          value: {
            phone: '+251911223344',
            dateOfBirth: '1990-05-15',
            gender: 'MALE',
            maritalStatus: 'SINGLE',
          },
        },
      },
    }),
    ApiProtected({ path, roles: [OnboardingPermissions.UPDATE] }),
    ApiDefaultErrors({
      path,
      badRequest: 'Task does not map to USER_PROFILE',
      notFound: 'Task instance not found',
      unauthorized: 'Unauthorized: missing or invalid bearer access token',
      forbidden: 'Required roles are missing',
    }),
  );
}

export function ApiSubmitAddressTask() {
  const path = '/api/v1/hr/onboarding/tasks/:taskId/address';
  return applyDecorators(
    ApiOperation({
      summary: 'Employee: submit address',
      description:
        'Upserts `EmployeeAddress` with `status: PENDING_REVIEW`. ' +
        'Checklist transitions to `SUBMITTED` (or `COMPLETED` if no HR verify required).',
    }),
    ApiParam({ name: 'taskId', description: 'OnboardingTaskInstance UUID' }),
    ApiBody({
      type: SubmitAddressTaskDto,
      examples: {
        address: {
          summary: 'Addis Ababa address',
          value: {
            countryId: 'country-uuid-et',
            city: 'Addis Ababa',
            subCity: 'Bole',
            street: 'Africa Avenue',
            postalCode: '1000',
          },
        },
      },
    }),
    ApiProtected({ path, roles: [OnboardingPermissions.UPDATE] }),
    ApiDefaultErrors({
      path,
      badRequest: 'Task does not map to EMPLOYEE_ADDRESS',
      notFound: 'Task instance not found',
      unauthorized: 'Unauthorized: missing or invalid bearer access token',
      forbidden: 'Required roles are missing',
    }),
  );
}

export function ApiSubmitBankDetailTask() {
  const path = '/api/v1/hr/onboarding/tasks/:taskId/bank-detail';
  return applyDecorators(
    ApiOperation({
      summary: 'Employee: submit bank account details',
      description:
        'Creates/updates the primary `BankAccount` under `EmployeeBankDetail` wrapper. ' +
        'Wrapper status set to `PENDING_REVIEW`.',
    }),
    ApiParam({ name: 'taskId', description: 'OnboardingTaskInstance UUID' }),
    ApiBody({
      type: SubmitBankDetailTaskDto,
      examples: {
        bank: {
          summary: 'CBE account',
          value: {
            bankName: 'Commercial Bank of Ethiopia',
            branch: 'Bole Branch',
            accountType: 'SAVING',
            accountNumber: '1000123456789',
          },
        },
      },
    }),
    ApiProtected({ path, roles: [OnboardingPermissions.UPDATE] }),
    ApiDefaultErrors({
      path,
      badRequest: 'Task does not map to EMPLOYEE_BANK_DETAIL',
      notFound: 'Task instance not found',
      unauthorized: 'Unauthorized: missing or invalid bearer access token',
      forbidden: 'Required roles are missing',
    }),
  );
}

export function ApiSubmitEmergencyContactTask() {
  const path = '/api/v1/hr/onboarding/tasks/:taskId/emergency-contact';
  return applyDecorators(
    ApiOperation({
      summary: 'Employee: submit emergency contact',
      description:
        'Creates or updates the primary `EmergencyContact` under the `EmployeeEmergencyContact` wrapper.',
    }),
    ApiParam({ name: 'taskId', description: 'OnboardingTaskInstance UUID' }),
    ApiBody({
      type: SubmitEmergencyContactTaskDto,
      examples: {
        contact: {
          summary: 'Spouse emergency contact',
          value: {
            name: 'Almaz Bekele',
            relationship: 'Spouse',
            phone: '+251922334455',
          },
        },
      },
    }),
    ApiProtected({ path, roles: [OnboardingPermissions.UPDATE] }),
    ApiDefaultErrors({
      path,
      badRequest: 'Task does not map to EMPLOYEE_EMERGENCY_CONTACT',
      notFound: 'Task instance not found',
      unauthorized: 'Unauthorized: missing or invalid bearer access token',
      forbidden: 'Required roles are missing',
    }),
  );
}

export function ApiSubmitEducationTask() {
  const path = '/api/v1/hr/onboarding/tasks/:taskId/education';
  return applyDecorators(
    ApiOperation({
      summary: 'Employee: submit education record',
      description:
        'Creates or updates the most recent `Education` child under `EmployeeEducation` wrapper.',
    }),
    ApiParam({ name: 'taskId', description: 'OnboardingTaskInstance UUID' }),
    ApiBody({
      type: SubmitEducationTaskDto,
      examples: {
        edu: {
          summary: 'BSc degree',
          value: {
            institution: 'Addis Ababa University',
            degree: 'BSc',
            fieldOfStudy: 'Computer Science',
            startDate: '2014-09-01',
            endDate: '2018-07-15',
          },
        },
      },
    }),
    ApiProtected({ path, roles: [OnboardingPermissions.UPDATE] }),
    ApiDefaultErrors({
      path,
      badRequest: 'Task does not map to EMPLOYEE_EDUCATION',
      notFound: 'Task instance not found',
      unauthorized: 'Unauthorized: missing or invalid bearer access token',
      forbidden: 'Required roles are missing',
    }),
  );
}

export function ApiSubmitContractTask() {
  const path = '/api/v1/hr/onboarding/tasks/:taskId/contract';
  return applyDecorators(
    ApiOperation({
      summary: 'Employee: submit / acknowledge a contract',
      description:
        'Links a `Contract` record to the `EmployeeContract` wrapper with `status: PENDING_REVIEW`. ' +
        'Optionally attaches the signed file URL.',
    }),
    ApiParam({ name: 'taskId', description: 'OnboardingTaskInstance UUID' }),
    ApiBody({
      type: SubmitContractTaskDto,
      examples: {
        contract: {
          summary: 'Link signed contract',
          value: {
            contractId: 'contract-uuid-1',
            signedFileUrl:
              'https://storage.example.com/contracts/signed-nda.pdf',
          },
        },
      },
    }),
    ApiProtected({ path, roles: [OnboardingPermissions.UPDATE] }),
    ApiDefaultErrors({
      path,
      badRequest:
        'Task does not map to EMPLOYEE_CONTRACT or contract not found',
      notFound: 'Task instance not found',
      unauthorized: 'Unauthorized: missing or invalid bearer access token',
      forbidden: 'Required roles are missing',
    }),
  );
}

export function ApiSubmitPolicyTask() {
  const path = '/api/v1/hr/onboarding/tasks/:taskId/policy';
  return applyDecorators(
    ApiOperation({
      summary: 'Employee: acknowledge policies',
      description:
        'Records `PolicyAcknowledgement` entries for each policy/version the employee signs off on.',
    }),
    ApiParam({ name: 'taskId', description: 'OnboardingTaskInstance UUID' }),
    ApiBody({
      type: SubmitPolicyTaskDto,
      examples: {
        policy: {
          summary: 'Multi-policy acknowledgement',
          value: {
            acknowledgements: [
              { policyId: 'policy-uuid-1', policyVersionId: 'version-uuid-1' },
              { policyId: 'policy-uuid-2', policyVersionId: 'version-uuid-2' },
            ],
          },
        },
      },
    }),
    ApiProtected({ path, roles: [OnboardingPermissions.UPDATE] }),
    ApiDefaultErrors({
      path,
      badRequest: 'Task does not map to EMPLOYEE_POLICY_ACKNOWLEDGEMENT',
      notFound: 'Task instance not found',
      unauthorized: 'Unauthorized: missing or invalid bearer access token',
      forbidden: 'Required roles are missing',
    }),
  );
}

export function ApiMarkCustomTaskDone() {
  const path = '/api/v1/hr/onboarding/tasks/:taskId/done';
  return applyDecorators(
    ApiOperation({
      summary: 'Employee: mark custom task as done',
      description:
        'For `CUSTOM` task types only. ' +
        'Transitions the checklist item to `COMPLETED` immediately, ' +
        'or to `SUBMITTED` if `requiresHrVerification` is true on the task definition.',
    }),
    ApiParam({ name: 'taskId', description: 'OnboardingTaskInstance UUID' }),
    ApiProtected({ path, roles: [OnboardingPermissions.UPDATE] }),
    ApiDefaultErrors({
      path,
      badRequest: 'Task is not of type CUSTOM or onboarding is cancelled',
      notFound: 'Task instance not found',
      unauthorized: 'Unauthorized: missing or invalid bearer access token',
      forbidden: 'Required roles are missing',
    }),
  );
}

// ─── Phase 5: HR Verification decorators ─────────────────────────────────────

export function ApiVerifyProfileTask() {
  return buildVerifyDecorator('UserProfile', 'profile');
}

export function ApiVerifyAddressTask() {
  return buildVerifyDecorator('EmployeeAddress', 'address');
}

export function ApiVerifyBankDetailTask() {
  return buildVerifyDecorator('EmployeeBankDetail', 'bank-detail');
}

export function ApiVerifyEmergencyContactTask() {
  return buildVerifyDecorator('EmployeeEmergencyContact', 'emergency-contact');
}

export function ApiVerifyEducationTask() {
  return buildVerifyDecorator('EmployeeEducation', 'education');
}

export function ApiVerifyContractTask() {
  return buildVerifyDecorator('EmployeeContract', 'contract');
}

export function ApiVerifyPolicyTask() {
  return buildVerifyDecorator('PolicyAcknowledgement', 'policy');
}

export function ApiVerifyCustomTask() {
  const path = '/api/v1/hr/onboarding/tasks/:taskId/done/verify';
  return applyDecorators(
    ApiOperation({
      summary: 'HR: verify a custom task submission',
      description:
        'Approves or rejects a `CUSTOM` task that was submitted for HR review.\n\n' +
        '- **Approve** → checklist → `COMPLETED`.\n' +
        '- **Reject**  → checklist → `CHANGES_REQUESTED` with feedback.',
    }),
    ApiParam({ name: 'taskId', description: 'OnboardingTaskInstance UUID' }),
    ApiBody({
      type: VerifyPayloadDto,
      examples: {
        approve: { summary: 'Approve', value: { approved: true } },
        reject: {
          summary: 'Reject with reason',
          value: {
            approved: false,
            hrFeedback: 'Laptop was not collected from IT.',
          },
        },
      },
    }),
    ApiProtected({ path, roles: [OnboardingPermissions.VERIFY] }),
    ApiDefaultErrors({
      path,
      badRequest: 'Task is not CUSTOM type or not in SUBMITTED state',
      notFound: 'Task instance not found',
      unauthorized: 'Unauthorized: missing or invalid bearer access token',
      forbidden: 'Required roles are missing',
    }),
  );
}
