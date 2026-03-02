import { Module } from '@nestjs/common';
import { EmployeesController } from './employees/employees.controller';
import { ListEmployeesUseCase } from './employees/use-cases/list-employees.usecase';
import { GetEmployeeFullUseCase } from './employees/use-cases/get-employee-full.usecase';
import { EmployeeDocumentsController } from './documents/employee-documents.controller';
import { ListEmployeeDocumentsUseCase } from './documents/use-cases/list-employee-documents.usecase';
import { CreateEmployeeDocumentUseCase } from './documents/use-cases/create-employee-document.usecase';
import { UpdateEmployeeDocumentUseCase } from './documents/use-cases/update-employee-document.usecase';
import { EmployeeContractsController } from './contracts/employee-contracts.controller';
import { ListEmployeeContractsUseCase } from './contracts/use-cases/list-employee-contracts.usecase';
import { CreateContractUseCase } from './contracts/use-cases/create-contract.usecase';
import { UpdateContractUseCase } from './contracts/use-cases/update-contract.usecase';
import { JobDescriptionsController } from './job-descriptions/job-descriptions.controller';
import { ListJobDescriptionsUseCase } from './job-descriptions/use-cases/list-job-descriptions.usecase';
import { GetJobDescriptionUseCase } from './job-descriptions/use-cases/get-job-description.usecase';
import { CreateJobDescriptionUseCase } from './job-descriptions/use-cases/create-job-description.usecase';
import { UpdateJobDescriptionUseCase } from './job-descriptions/use-cases/update-job-description.usecase';
import { DocumentExpiryJob } from './jobs/document-expiry.job';
import { RecruitmentRequestsController } from './recruitment/recruitment-requests.controller';
import { HiringDecisionsController } from './recruitment/hiring-decisions.controller';
import { ListRecruitmentRequestsUseCase } from './recruitment/use-cases/list-recruitment-requests.usecase';
import { GetRecruitmentRequestUseCase } from './recruitment/use-cases/get-recruitment-request.usecase';
import { CreateRecruitmentRequestUseCase } from './recruitment/use-cases/create-recruitment-request.usecase';
import { UpdateRecruitmentRequestUseCase } from './recruitment/use-cases/update-recruitment-request.usecase';
import { SubmitRecruitmentRequestUseCase } from './recruitment/use-cases/submit-recruitment-request.usecase';
import { ApproveRecruitmentRequestUseCase } from './recruitment/use-cases/approve-recruitment-request.usecase';
import { CreateJobPostingFromRequestUseCase } from './recruitment/use-cases/create-job-posting-from-request.usecase';
import { CreateHiringDecisionUseCase } from './recruitment/use-cases/create-hiring-decision.usecase';
import { GetHiringDecisionUseCase } from './recruitment/use-cases/get-hiring-decision.usecase';
import { FinalizeHiringDecisionUseCase } from './recruitment/use-cases/finalize-hiring-decision.usecase';
import { AcceptHiringOfferUseCase } from './recruitment/use-cases/accept-hiring-offer.usecase';
import { OnboardingController } from './onboarding/onboarding.controller';
import { CreateOnboardingChecklistUseCase } from './onboarding/use-cases/create-onboarding-checklist.usecase';
import { GetOnboardingChecklistUseCase } from './onboarding/use-cases/get-onboarding-checklist.usecase';
import { ListOnboardingChecklistsUseCase } from './onboarding/use-cases/list-onboarding-checklists.usecase';
import { UpdateOnboardingChecklistUseCase } from './onboarding/use-cases/update-onboarding-checklist.usecase';
import { UpdateOnboardingTaskUseCase } from './onboarding/use-cases/update-onboarding-task.usecase';
import { LeaveController } from './leave/leave.controller';
import { CreateLeaveRequestUseCase } from './leave/use-cases/create-leave-request.usecase';
import { ListLeaveRequestsUseCase } from './leave/use-cases/list-leave-requests.usecase';
import { GetLeaveRequestUseCase } from './leave/use-cases/get-leave-request.usecase';
import { SubmitLeaveRequestUseCase } from './leave/use-cases/submit-leave-request.usecase';
import { ApproveLeaveRequestUseCase } from './leave/use-cases/approve-leave-request.usecase';
import { RejectLeaveRequestUseCase } from './leave/use-cases/reject-leave-request.usecase';
import { GetLeaveBalanceUseCase } from './leave/use-cases/get-leave-balance.usecase';
import { AttendanceController } from './attendance/attendance.controller';
import { UpsertAttendanceLogUseCase } from './attendance/use-cases/upsert-attendance-log.usecase';
import { ListAttendanceLogsUseCase } from './attendance/use-cases/list-attendance-logs.usecase';
import { GetAttendanceLogUseCase } from './attendance/use-cases/get-attendance-log.usecase';

@Module({
  controllers: [
    EmployeesController,
    EmployeeDocumentsController,
    EmployeeContractsController,
    JobDescriptionsController,
    RecruitmentRequestsController,
    HiringDecisionsController,
    OnboardingController,
    LeaveController,
    AttendanceController,
  ],
  providers: [
    ListEmployeesUseCase,
    GetEmployeeFullUseCase,
    ListEmployeeDocumentsUseCase,
    CreateEmployeeDocumentUseCase,
    UpdateEmployeeDocumentUseCase,
    ListEmployeeContractsUseCase,
    CreateContractUseCase,
    UpdateContractUseCase,
    ListJobDescriptionsUseCase,
    GetJobDescriptionUseCase,
    CreateJobDescriptionUseCase,
    UpdateJobDescriptionUseCase,
    DocumentExpiryJob,
    ListRecruitmentRequestsUseCase,
    GetRecruitmentRequestUseCase,
    CreateRecruitmentRequestUseCase,
    UpdateRecruitmentRequestUseCase,
    SubmitRecruitmentRequestUseCase,
    ApproveRecruitmentRequestUseCase,
    CreateJobPostingFromRequestUseCase,
    CreateHiringDecisionUseCase,
    GetHiringDecisionUseCase,
    FinalizeHiringDecisionUseCase,
    AcceptHiringOfferUseCase,
    CreateOnboardingChecklistUseCase,
    ListOnboardingChecklistsUseCase,
    GetOnboardingChecklistUseCase,
    UpdateOnboardingChecklistUseCase,
    UpdateOnboardingTaskUseCase,
    CreateLeaveRequestUseCase,
    ListLeaveRequestsUseCase,
    GetLeaveRequestUseCase,
    SubmitLeaveRequestUseCase,
    ApproveLeaveRequestUseCase,
    RejectLeaveRequestUseCase,
    GetLeaveBalanceUseCase,
    UpsertAttendanceLogUseCase,
    ListAttendanceLogsUseCase,
    GetAttendanceLogUseCase,
  ],
})
export class HrModule {}
