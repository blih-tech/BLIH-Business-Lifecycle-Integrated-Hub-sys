import { Module } from '@nestjs/common';
import { EmployeesController } from './employees/employees.controller';
import { EmployeeRecordsController } from './employees/employee-records.controller';
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
import { AttendanceReconciliationJob } from './jobs/attendance-reconciliation.job';
import { JobsController } from './recruitment/jobs.controller';
import { ApplicantsController } from './recruitment/applicants.controller';
import { InterviewsController } from './recruitment/interviews.controller';
import { RecruitmentNotificationService } from './recruitment/recruitment-notification.service';
import {
  ApproveJobUseCase,
  CloseJobUseCase,
  CreateApplicantUseCase,
  CreateInterviewUseCase,
  CreateJobUseCase,
  GetApplicantUseCase,
  GetInterviewUseCase,
  GetJobUseCase,
  ListApplicantsUseCase,
  ListInterviewsUseCase,
  ListJobsUseCase,
  PublishJobUseCase,
  SubmitJobUseCase,
  UpdateApplicantStatusUseCase,
  UpdateApplicantUseCase,
  UpdateInterviewUseCase,
  UpdateJobUseCase,
  UpsertJobResponsibilitiesUseCase,
  UpsertJobSkillsUseCase,
  UpsertJobToolsUseCase,
} from './recruitment/use-cases';

import { LeaveController } from './leave/leave.controller';
import { CancelLeaveRequestUseCase } from './leave/use-cases/cancel-leave-request.usecase';
import { CreateLeaveRequestUseCase } from './leave/use-cases/create-leave-request.usecase';
import { ListLeaveRequestsUseCase } from './leave/use-cases/list-leave-requests.usecase';
import { GetLeaveRequestUseCase } from './leave/use-cases/get-leave-request.usecase';
import { SubmitLeaveRequestUseCase } from './leave/use-cases/submit-leave-request.usecase';
import { ApproveLeaveRequestUseCase } from './leave/use-cases/approve-leave-request.usecase';
import { RejectLeaveRequestUseCase } from './leave/use-cases/reject-leave-request.usecase';
import { GetLeaveBalanceUseCase } from './leave/use-cases/get-leave-balance.usecase';
import { UpdateLeaveRequestUseCase } from './leave/use-cases/update-leave-request.usecase';
import { AttendanceController } from './attendance/attendance.controller';
import { AttendanceReportingService } from './attendance/attendance-reporting.service';
import { AttendanceCorrectionService } from './attendance/attendance-correction.service';
import { AttendanceCalendarService } from './attendance/attendance-calendar.service';
import { AttendanceReconciliationService } from './attendance/attendance-reconciliation.service';
import { FlexWorkRequestService } from './attendance/flex-work-request.service';
import { OvertimeRequestService } from './attendance/overtime-request.service';
import { PunctualityService } from './attendance/punctuality.service';
import { TimesheetService } from './attendance/timesheet.service';
import { AssignUserWorkScheduleUseCase } from './attendance/use-cases/assign-user-work-schedule.usecase';
import { CreateHolidayUseCase } from './attendance/use-cases/create-holiday.usecase';
import { CreateWorkScheduleUseCase } from './attendance/use-cases/create-work-schedule.usecase';
import { UpsertAttendanceLogUseCase } from './attendance/use-cases/upsert-attendance-log.usecase';
import { ListAttendanceLogsUseCase } from './attendance/use-cases/list-attendance-logs.usecase';
import { GetAttendanceLogUseCase } from './attendance/use-cases/get-attendance-log.usecase';
import { ListHolidaysUseCase } from './attendance/use-cases/list-holidays.usecase';
import { ListUserWorkSchedulesUseCase } from './attendance/use-cases/list-user-work-schedules.usecase';
import { ListWorkSchedulesUseCase } from './attendance/use-cases/list-work-schedules.usecase';
import { HrUserLifecycleService } from './hr-user-lifecycle.service';
import { LeaveBalanceService } from './leave/leave-balance.service';
import { PerformanceController } from './performance/performance.controller';
import { ListReviewPeriodsUseCase } from './performance/use-cases/list-review-periods.usecase';
import { EnsureReviewPeriodUseCase } from './performance/use-cases/ensure-review-period.usecase';
import { CreatePerformanceReviewUseCase } from './performance/use-cases/create-performance-review.usecase';
import { ListPerformanceReviewsUseCase } from './performance/use-cases/list-performance-reviews.usecase';
import { GetPerformanceReviewUseCase } from './performance/use-cases/get-performance-review.usecase';
import { UpdateSelfAssessmentUseCase } from './performance/use-cases/update-self-assessment.usecase';
import { UpdateManagerReviewUseCase } from './performance/use-cases/update-manager-review.usecase';
import { CompletePerformanceReviewUseCase } from './performance/use-cases/complete-performance-review.usecase';
import { GetAnnualSummaryUseCase } from './performance/use-cases/get-annual-summary.usecase';
import { ListPerformanceCalibrationsUseCase } from './performance/use-cases/list-performance-calibrations.usecase';
import { ListPerformanceReviewFeedbackUseCase } from './performance/use-cases/list-performance-review-feedback.usecase';
import { UpsertPerformanceCalibrationUseCase } from './performance/use-cases/upsert-performance-calibration.usecase';
import { UpsertPerformanceReviewFeedbackUseCase } from './performance/use-cases/upsert-performance-review-feedback.usecase';
import { OkrController } from './okr/okr.controller';
import { OkrManagerReviewService } from './okr/okr-manager-review.service';
import { CreateOkrUseCase } from './okr/use-cases/create-okr.usecase';
import { ListOkrsUseCase } from './okr/use-cases/list-okrs.usecase';
import { GetOkrUseCase } from './okr/use-cases/get-okr.usecase';
import { UpdateOkrUseCase } from './okr/use-cases/update-okr.usecase';
import { UpdateKeyResultUseCase } from './okr/use-cases/update-key-result.usecase';
import { GetOkrProgressUseCase } from './okr/use-cases/get-okr-progress.usecase';
import { ListKeyResultUpdatesUseCase } from './okr/use-cases/list-key-result-updates.usecase';
import { ReweightKeyResultsUseCase } from './okr/use-cases/reweight-key-results.usecase';
import { PromotionProposalsController } from './talent/promotion-proposals.controller';
import { SuccessionPlansController } from './talent/succession-plans.controller';
import { CreatePromotionProposalUseCase } from './talent/use-cases/create-promotion-proposal.usecase';
import { CreateSuccessionPlanUseCase } from './talent/use-cases/create-succession-plan.usecase';
import { GetPromotionProposalUseCase } from './talent/use-cases/get-promotion-proposal.usecase';
import { ListPromotionProposalsUseCase } from './talent/use-cases/list-promotion-proposals.usecase';
import { ListSuccessionPlansUseCase } from './talent/use-cases/list-succession-plans.usecase';
import { ReviewPromotionProposalUseCase } from './talent/use-cases/review-promotion-proposal.usecase';
import { UpdateSuccessionPlanUseCase } from './talent/use-cases/update-succession-plan.usecase';
import { TrainingController } from './training/training.controller';
import { TrainingFeedbackController } from './training/training-feedback.controller';
import { TrainingAnalyticsController } from './training/training-analytics.controller';
import { TrainingCertificationsController } from './training/training-certifications.controller';
import { TrainingComplianceController } from './training/training-compliance.controller';
import { TrainingFeedbackService } from './training/training-feedback.service';
import { TrainingAnalyticsService } from './training/training-analytics.service';
import { TrainingCertificationService } from './training/training-certification.service';
import { TrainingComplianceService } from './training/training-compliance.service';
import { TrainingProfileSyncService } from './training/training-profile-sync.service';
import { TrainingNeedsAssessmentService } from './training/training-needs-assessment.service';
import { ListSkillsUseCase } from './training/use-cases/list-skills.usecase';
import { CreateSkillUseCase } from './training/use-cases/create-skill.usecase';
import { GetEmployeeSkillsUseCase } from './training/use-cases/get-employee-skills.usecase';
import { UpsertEmployeeSkillsUseCase } from './training/use-cases/upsert-employee-skills.usecase';
import { GetTrainingBudgetUseCase } from './training/use-cases/get-training-budget.usecase';
import { CreateTrainingRequestUseCase } from './training/use-cases/create-training-request.usecase';
import { ListTrainingRequestsUseCase } from './training/use-cases/list-training-requests.usecase';
import { GetTrainingRequestUseCase } from './training/use-cases/get-training-request.usecase';
import { ApproveTrainingRequestUseCase } from './training/use-cases/approve-training-request.usecase';
import { CreateTrainingCompletionUseCase } from './training/use-cases/create-training-completion.usecase';
import { ListTrainingCompletionsUseCase } from './training/use-cases/list-training-completions.usecase';
import { GetTrainingCompletionUseCase } from './training/use-cases/get-training-completion.usecase';
import { UpdateTrainingCompletionUseCase } from './training/use-cases/update-training-completion.usecase';
import { CreateSkillGapAssessmentUseCase } from './training/use-cases/create-skill-gap-assessment.usecase';
import { ListSkillGapAssessmentsUseCase } from './training/use-cases/list-skill-gap-assessments.usecase';
import { GetSkillGapAssessmentUseCase } from './training/use-cases/get-skill-gap-assessment.usecase';
import { GetIndividualSkillGapUseCase } from './training/use-cases/get-individual-skill-gap.usecase';
import { CertificationExpiryJob } from './jobs/certification-expiry.job';
import { RecruitmentJobLifecycleJob } from './jobs/recruitment-job-lifecycle.job';
import { RelationsController } from './relations/relations.controller';
import { OffboardingController } from './offboarding/offboarding.controller';
import { CreateResignationUseCase } from './offboarding/use-cases/create-resignation.usecase';
import { ListResignationsUseCase } from './offboarding/use-cases/list-resignations.usecase';
import { GetResignationUseCase } from './offboarding/use-cases/get-resignation.usecase';
import { UpdateResignationUseCase } from './offboarding/use-cases/update-resignation.usecase';
import { GenerateOffboardingChecklistUseCase } from './offboarding/use-cases/generate-offboarding-checklist.usecase';
import { GetOffboardingChecklistUseCase } from './offboarding/use-cases/get-offboarding-checklist.usecase';
import { CompleteOffboardingTaskUseCase } from './offboarding/use-cases/complete-offboarding-task.usecase';
import { CreateExitInterviewUseCase } from './offboarding/use-cases/create-exit-interview.usecase';
import { ListExitInterviewsUseCase } from './offboarding/use-cases/list-exit-interviews.usecase';
import { CreateFinalSettlementUseCase } from './offboarding/use-cases/create-final-settlement.usecase';
import { GetFinalSettlementUseCase } from './offboarding/use-cases/get-final-settlement.usecase';
import { UpdateFinalSettlementUseCase } from './offboarding/use-cases/update-final-settlement.usecase';
import { CreateAssetReturnUseCase } from './offboarding/use-cases/create-asset-return.usecase';
import { UpdateAssetReturnUseCase } from './offboarding/use-cases/update-asset-return.usecase';
import { CreateComplianceChecklistUseCase } from './offboarding/use-cases/create-compliance-checklist.usecase';
import { UpdateComplianceChecklistUseCase } from './offboarding/use-cases/update-compliance-checklist.usecase';
import { CompleteOffboardingUseCase } from './offboarding/use-cases/complete-offboarding.usecase';
import { CreateIncidentReportUseCase } from './relations/use-cases/create-incident-report.usecase';
import { ListIncidentReportsUseCase } from './relations/use-cases/list-incident-reports.usecase';
import { GetIncidentReportUseCase } from './relations/use-cases/get-incident-report.usecase';
import { UpdateIncidentReportUseCase } from './relations/use-cases/update-incident-report.usecase';
import { CreateDisciplinaryActionUseCase } from './relations/use-cases/create-disciplinary-action.usecase';
import { ListDisciplinaryActionsUseCase } from './relations/use-cases/list-disciplinary-actions.usecase';
import { GetDisciplinaryActionUseCase } from './relations/use-cases/get-disciplinary-action.usecase';
import { CreateGrievanceUseCase } from './relations/use-cases/create-grievance.usecase';
import { ListGrievancesUseCase } from './relations/use-cases/list-grievances.usecase';
import { GetGrievanceUseCase } from './relations/use-cases/get-grievance.usecase';
import { UpdateGrievanceUseCase } from './relations/use-cases/update-grievance.usecase';
import { CreateRecognitionUseCase } from './relations/use-cases/create-recognition.usecase';
import { ListRecognitionsUseCase } from './relations/use-cases/list-recognitions.usecase';
import { GetRecognitionUseCase } from './relations/use-cases/get-recognition.usecase';
import { ApproveRecognitionUseCase } from './relations/use-cases/approve-recognition.usecase';
import { CreateSurveyUseCase } from './relations/use-cases/create-survey.usecase';
import { ListSurveysUseCase } from './relations/use-cases/list-surveys.usecase';
import { GetSurveyUseCase } from './relations/use-cases/get-survey.usecase';
import { UpdateSurveyUseCase } from './relations/use-cases/update-survey.usecase';
import { SubmitSurveyResponseUseCase } from './relations/use-cases/submit-survey-response.usecase';
import { GetSurveyResultsUseCase } from './relations/use-cases/get-survey-results.usecase';
import { CreateMediationUseCase } from './relations/use-cases/create-mediation.usecase';
import { ListMediationsUseCase } from './relations/use-cases/list-mediations.usecase';
import { GetMediationUseCase } from './relations/use-cases/get-mediation.usecase';
import { UpdateMediationUseCase } from './relations/use-cases/update-mediation.usecase';
import { GetUserProfileUseCase } from '../../core/users/use-cases/get-user-profile.usecase';
import { UpdateUserProfileUseCase } from '../../core/users/use-cases/update-user-profile.usecase';
import { GetUserEmploymentUseCase } from '../../core/users/use-cases/get-user-employment.usecase';
import { UpdateUserEmploymentUseCase } from '../../core/users/use-cases/update-user-employment.usecase';
import { GetUserCompensationUseCase } from '../../core/users/use-cases/get-user-compensation.usecase';
import { UpdateUserCompensationUseCase } from '../../core/users/use-cases/update-user-compensation.usecase';
import { ListCompensationComponentsUseCase } from '../../core/users/use-cases/list-compensation-components.usecase';
import { CreateCompensationComponentUseCase } from '../../core/users/use-cases/create-compensation-component.usecase';
import { UpdateCompensationComponentUseCase } from '../../core/users/use-cases/update-compensation-component.usecase';
import { DeleteCompensationComponentUseCase } from '../../core/users/use-cases/delete-compensation-component.usecase';
import { ListUserCompensationHistoryUseCase } from '../../core/users/use-cases/list-user-compensation-history.usecase';
import { GetUserLifecycleUseCase } from '../../core/users/use-cases/get-user-lifecycle.usecase';
import { UpdateUserLifecycleUseCase } from '../../core/users/use-cases/update-user-lifecycle.usecase';
import { CareerDevelopmentController } from './career/career-development.controller';
import { CareerDevelopmentService } from './career/career-development.service';
import { InternalTransfersController } from './career/internal-transfers.controller';
import { InternalTransferService } from './career/internal-transfer.service';
import { SalaryAdjustmentsController } from './career/salary-adjustments.controller';
import { SalaryAdjustmentService } from './career/salary-adjustment.service';
import { OnboardingModule } from './onboarding/onboarding.module';

@Module({
  imports: [OnboardingModule],
  controllers: [
    EmployeesController,
    EmployeeRecordsController,
    EmployeeDocumentsController,
    EmployeeContractsController,
    JobDescriptionsController,
    JobsController,
    ApplicantsController,
    InterviewsController,
    LeaveController,
    AttendanceController,
    PerformanceController,
    OkrController,
    CareerDevelopmentController,
    SuccessionPlansController,
    PromotionProposalsController,
    TrainingController,
    TrainingFeedbackController,
    TrainingAnalyticsController,
    TrainingCertificationsController,
    TrainingComplianceController,
    InternalTransfersController,
    SalaryAdjustmentsController,
    RelationsController,
    OffboardingController,
  ],
  providers: [
    ListEmployeesUseCase,
    GetEmployeeFullUseCase,
    GetUserProfileUseCase,
    UpdateUserProfileUseCase,
    GetUserEmploymentUseCase,
    UpdateUserEmploymentUseCase,
    GetUserCompensationUseCase,
    UpdateUserCompensationUseCase,
    ListCompensationComponentsUseCase,
    CreateCompensationComponentUseCase,
    UpdateCompensationComponentUseCase,
    DeleteCompensationComponentUseCase,
    ListUserCompensationHistoryUseCase,
    GetUserLifecycleUseCase,
    UpdateUserLifecycleUseCase,
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
    AttendanceReconciliationJob,
    CertificationExpiryJob,
    RecruitmentJobLifecycleJob,
    CreateJobUseCase,
    ListJobsUseCase,
    GetJobUseCase,
    UpdateJobUseCase,
    SubmitJobUseCase,
    ApproveJobUseCase,
    PublishJobUseCase,
    CloseJobUseCase,
    UpsertJobSkillsUseCase,
    UpsertJobToolsUseCase,
    UpsertJobResponsibilitiesUseCase,
    CreateApplicantUseCase,
    ListApplicantsUseCase,
    GetApplicantUseCase,
    UpdateApplicantUseCase,
    UpdateApplicantStatusUseCase,
    CreateInterviewUseCase,
    ListInterviewsUseCase,
    GetInterviewUseCase,
    UpdateInterviewUseCase,
    RecruitmentNotificationService,
    CreateLeaveRequestUseCase,
    ListLeaveRequestsUseCase,
    GetLeaveRequestUseCase,
    UpdateLeaveRequestUseCase,
    SubmitLeaveRequestUseCase,
    ApproveLeaveRequestUseCase,
    RejectLeaveRequestUseCase,
    CancelLeaveRequestUseCase,
    GetLeaveBalanceUseCase,
    LeaveBalanceService,
    HrUserLifecycleService,
    AttendanceCalendarService,
    AttendanceReconciliationService,
    AttendanceReportingService,
    AttendanceCorrectionService,
    OvertimeRequestService,
    FlexWorkRequestService,
    TimesheetService,
    PunctualityService,
    CreateWorkScheduleUseCase,
    ListWorkSchedulesUseCase,
    AssignUserWorkScheduleUseCase,
    ListUserWorkSchedulesUseCase,
    CreateHolidayUseCase,
    ListHolidaysUseCase,
    UpsertAttendanceLogUseCase,
    ListAttendanceLogsUseCase,
    GetAttendanceLogUseCase,
    ListReviewPeriodsUseCase,
    EnsureReviewPeriodUseCase,
    CreatePerformanceReviewUseCase,
    ListPerformanceReviewsUseCase,
    GetPerformanceReviewUseCase,
    UpdateSelfAssessmentUseCase,
    UpdateManagerReviewUseCase,
    CompletePerformanceReviewUseCase,
    GetAnnualSummaryUseCase,
    ListPerformanceReviewFeedbackUseCase,
    UpsertPerformanceReviewFeedbackUseCase,
    ListPerformanceCalibrationsUseCase,
    UpsertPerformanceCalibrationUseCase,
    CreateOkrUseCase,
    ListOkrsUseCase,
    GetOkrUseCase,
    UpdateOkrUseCase,
    UpdateKeyResultUseCase,
    GetOkrProgressUseCase,
    ListKeyResultUpdatesUseCase,
    ReweightKeyResultsUseCase,
    OkrManagerReviewService,
    CareerDevelopmentService,
    InternalTransferService,
    SalaryAdjustmentService,
    CreateSuccessionPlanUseCase,
    ListSuccessionPlansUseCase,
    UpdateSuccessionPlanUseCase,
    CreatePromotionProposalUseCase,
    ListPromotionProposalsUseCase,
    GetPromotionProposalUseCase,
    ReviewPromotionProposalUseCase,
    ListSkillsUseCase,
    CreateSkillUseCase,
    GetEmployeeSkillsUseCase,
    UpsertEmployeeSkillsUseCase,
    GetTrainingBudgetUseCase,
    CreateTrainingRequestUseCase,
    ListTrainingRequestsUseCase,
    GetTrainingRequestUseCase,
    ApproveTrainingRequestUseCase,
    TrainingProfileSyncService,
    CreateTrainingCompletionUseCase,
    ListTrainingCompletionsUseCase,
    GetTrainingCompletionUseCase,
    UpdateTrainingCompletionUseCase,
    CreateSkillGapAssessmentUseCase,
    ListSkillGapAssessmentsUseCase,
    GetSkillGapAssessmentUseCase,
    GetIndividualSkillGapUseCase,
    TrainingNeedsAssessmentService,
    TrainingFeedbackService,
    TrainingAnalyticsService,
    TrainingCertificationService,
    TrainingComplianceService,
    CreateIncidentReportUseCase,
    ListIncidentReportsUseCase,
    GetIncidentReportUseCase,
    UpdateIncidentReportUseCase,
    CreateDisciplinaryActionUseCase,
    ListDisciplinaryActionsUseCase,
    GetDisciplinaryActionUseCase,
    CreateGrievanceUseCase,
    ListGrievancesUseCase,
    GetGrievanceUseCase,
    UpdateGrievanceUseCase,
    CreateRecognitionUseCase,
    ListRecognitionsUseCase,
    GetRecognitionUseCase,
    ApproveRecognitionUseCase,
    CreateSurveyUseCase,
    ListSurveysUseCase,
    GetSurveyUseCase,
    UpdateSurveyUseCase,
    SubmitSurveyResponseUseCase,
    GetSurveyResultsUseCase,
    CreateMediationUseCase,
    ListMediationsUseCase,
    GetMediationUseCase,
    UpdateMediationUseCase,
    CreateResignationUseCase,
    ListResignationsUseCase,
    GetResignationUseCase,
    UpdateResignationUseCase,
    GenerateOffboardingChecklistUseCase,
    GetOffboardingChecklistUseCase,
    CompleteOffboardingTaskUseCase,
    CreateExitInterviewUseCase,
    ListExitInterviewsUseCase,
    CreateFinalSettlementUseCase,
    GetFinalSettlementUseCase,
    UpdateFinalSettlementUseCase,
    CreateAssetReturnUseCase,
    UpdateAssetReturnUseCase,
    CreateComplianceChecklistUseCase,
    UpdateComplianceChecklistUseCase,
    CompleteOffboardingUseCase,
  ],
})
export class HrModule {}
