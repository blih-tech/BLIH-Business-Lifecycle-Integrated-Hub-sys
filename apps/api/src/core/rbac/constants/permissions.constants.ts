export const UserPermissions = {
  VIEW: 'user:view',
  CREATE: 'user:create',
  UPDATE: 'user:update',
  DISABLE: 'user:disable',
  RESET_PASSWORD: 'user:reset_password',
  DELETE: 'user:delete',
  ASSIGN_ROLE: 'user:assign-role',
} as const;

export const UserProfilePermissions = {
  VIEW: 'user_profile:view',
  UPDATE: 'user_profile:update',
} as const;

export const UserEmploymentPermissions = {
  VIEW: 'user_employment:view',
  UPDATE: 'user_employment:update',
} as const;

export const UserCompensationPermissions = {
  VIEW: 'user_compensation:view',
  UPDATE: 'user_compensation:update',
  HISTORY_VIEW: 'user_compensation_history:view',
  HISTORY_CREATE: 'user_compensation_history:create',
  COMPONENT_VIEW: 'user_compensation:view_components',
  COMPONENT_MANAGE: 'user_compensation:manage_components',
} as const;

export const UserLifecyclePermissions = {
  VIEW: 'user_lifecycle:view',
  UPDATE: 'user_lifecycle:update',
} as const;

export const DepartmentPermissions = {
  VIEW: 'department:view',
  CREATE: 'department:create',
  UPDATE: 'department:update',
  DELETE: 'department:delete',
  ALL: 'department:*',
} as const;

export const PositionPermissions = {
  VIEW: 'position:view',
  CREATE: 'position:create',
  UPDATE: 'position:update',
  DELETE: 'position:delete',
  ALL: 'position:*',
} as const;

export const JobGradePermissions = {
  VIEW: 'job_grade:view',
  CREATE: 'job_grade:create',
  UPDATE: 'job_grade:update',
  DELETE: 'job_grade:delete',
  ALL: 'job_grade:*',
} as const;

export const SystemRolePermissions = {
  VIEW: 'system_role:view',
  CREATE: 'system_role:create',
  UPDATE: 'system_role:update',
  DELETE: 'system_role:delete',
  ASSIGN: 'system_role:assign',
  REVOKE: 'system_role:revoke',
  ALL: 'system_role:*',
} as const;

export const SystemPermissionPermissions = {
  VIEW: 'system_permission:view',
  CREATE: 'system_permission:create',
  UPDATE: 'system_permission:update',
  DELETE: 'system_permission:delete',
  ALL: 'system_permission:*',
} as const;

export const SystemResourcePermissions = {
  VIEW: 'system_resource:view',
  CREATE: 'system_resource:create',
  UPDATE: 'system_resource:update',
  DELETE: 'system_resource:delete',
  ALL: 'system_resource:*',
} as const;

export const SystemNotificationPermissions = {
  SEND: 'system_notification:send',
  VIEW: 'system_notification:view',
  ALL: 'system_notification:*',
} as const;

export const SystemAuditPermissions = {
  CREATE: 'system_audit:create',
  VIEW: 'system_audit:view',
  EXPORT: 'system_audit:export',
  ALL: 'system_audit:*',
} as const;

export const SystemConfigPermissions = {
  VIEW: 'system_config:view',
  UPDATE: 'system_config:update',
  ALL: 'system_config:*',
} as const;

export const SystemLogPermissions = {
  VIEW: 'system_log:view',
} as const;

export const EmployeePermissions = {
  VIEW: 'employee:view',
  CREATE: 'employee:create',
  UPDATE: 'employee:update',
  TERMINATE: 'employee:terminate',
  ALL: 'employee:*',
} as const;

export const LeavePermissions = {
  VIEW: 'leave:view',
  CREATE: 'leave:create',
  APPROVE: 'leave:approve',
  REJECT: 'leave:reject',
  ALL: 'leave:*',
} as const;

export const AttendancePermissions = {
  VIEW: 'attendance:view',
  CREATE: 'attendance:create',
  UPDATE: 'attendance:update',
  ALL: 'attendance:*',
} as const;

export const AttendanceCorrectionPermissions = {
  VIEW: 'attendance_correction:view',
  CREATE: 'attendance_correction:create',
  UPDATE: 'attendance_correction:update',
  APPROVE: 'attendance_correction:approve',
  REJECT: 'attendance_correction:reject',
  ALL: 'attendance_correction:*',
} as const;

export const OvertimePermissions = {
  VIEW: 'overtime:view',
  CREATE: 'overtime:create',
  UPDATE: 'overtime:update',
  APPROVE: 'overtime:approve',
  REJECT: 'overtime:reject',
  ALL: 'overtime:*',
} as const;

export const FlexWorkPermissions = {
  VIEW: 'flex_work:view',
  CREATE: 'flex_work:create',
  UPDATE: 'flex_work:update',
  APPROVE: 'flex_work:approve',
  REJECT: 'flex_work:reject',
  ALL: 'flex_work:*',
} as const;

export const PunctualityPermissions = {
  VIEW: 'punctuality:view',
  ALERT: 'punctuality:alert',
  ALL: 'punctuality:*',
} as const;

export const TimesheetPermissions = {
  VIEW: 'timesheet:view',
  CREATE: 'timesheet:create',
  UPDATE: 'timesheet:update',
  APPROVE: 'timesheet:approve',
  REJECT: 'timesheet:reject',
  ALL: 'timesheet:*',
} as const;

export const AttendanceReportPermissions = {
  VIEW: 'attendance_report:view',
  EXPORT: 'attendance_report:export',
  ALL: 'attendance_report:*',
} as const;

export const HrPayrollPermissions = {
  VIEW: 'hr_payroll:view',
  PROCESS: 'hr_payroll:process',
  APPROVE: 'hr_payroll:approve',
} as const;

export const InvoicePermissions = {
  VIEW: 'invoice:view',
  CREATE: 'invoice:create',
  APPROVE: 'invoice:approve',
  VOID: 'invoice:void',
  ALL: 'invoice:*',
} as const;

export const ExpensePermissions = {
  VIEW: 'expense:view',
  CREATE: 'expense:create',
  APPROVE: 'expense:approve',
  ALL: 'expense:*',
} as const;

export const FinanceReportPermissions = {
  VIEW: 'finance_report:view',
  EXPORT: 'finance_report:export',
  ALL: 'finance_report:*',
} as const;

export const ProjectPermissions = {
  VIEW: 'project:view',
  CREATE: 'project:create',
  UPDATE: 'project:update',
  DELETE: 'project:delete',
  ASSIGN_MEMBER: 'project:assign-member',
  ALL: 'project:*',
} as const;

export const TaskPermissions = {
  VIEW: 'task:view',
  CREATE: 'task:create',
  UPDATE: 'task:update',
  ASSIGN: 'task:assign',
  ALL: 'task:*',
} as const;

export const CrmClientPermissions = {
  VIEW: 'crm_client:view',
  CREATE: 'crm_client:create',
  UPDATE: 'crm_client:update',
  DELETE: 'crm_client:delete',
  ALL: 'crm_client:*',
} as const;

export const DealPermissions = {
  VIEW: 'deal:view',
  CREATE: 'deal:create',
  UPDATE: 'deal:update',
  CLOSE: 'deal:close',
  ALL: 'deal:*',
} as const;

export const PipelinePermissions = {
  VIEW: 'pipeline:view',
  MANAGE: 'pipeline:manage',
} as const;

export const BrainConfigPermissions = {
  VIEW: 'brain_config:view',
  UPDATE: 'brain_config:update',
  ALL: 'brain_config:*',
} as const;

export const JobPermissions = {
  VIEW: 'job:view',
  CREATE: 'job:create',
  UPDATE: 'job:update',
  DELETE: 'job:delete',
  SUBMIT: 'job:submit',
  PUBLISH: 'job:publish',
  CLOSE: 'job:close',
  MANAGE_SKILLS: 'job:manage_skills',
  MANAGE_TOOLS: 'job:manage_tools',
  MANAGE_RESPONSIBILITIES: 'job:manage_responsibilities',
  ALL: 'job:*',
} as const;

export const JobApprovalPermissions = {
  VIEW: 'job_approval:view',
  DECIDE: 'job_approval:decide',
  ALL: 'job_approval:*',
} as const;

export const CandidatePermissions = {
  VIEW: 'candidate:view',
  CREATE: 'candidate:create',
  UPDATE: 'candidate:update',
  DELETE: 'candidate:delete',
  ALL: 'candidate:*',
} as const;

export const JobApplicationPermissions = {
  VIEW: 'job_application:view',
  CREATE: 'job_application:create',
  UPDATE: 'job_application:update',
  DELETE: 'job_application:delete',
  ALL: 'job_application:*',
} as const;

export const InterviewPermissions = {
  VIEW: 'interview:view',
  CREATE: 'interview:create',
  UPDATE: 'interview:update',
  DELETE: 'interview:delete',
  ALL: 'interview:*',
} as const;

export const OnboardingChecklistPermissions = {
  VIEW: 'onboarding_checklist:view',
  CREATE: 'onboarding_checklist:create',
  UPDATE: 'onboarding_checklist:update',
  ALL: 'onboarding_checklist:*',
} as const;

export const AssetProvisioningPermissions = {
  VIEW: 'asset_provisioning:view',
  CREATE: 'asset_provisioning:create',
  UPDATE: 'asset_provisioning:update',
  APPROVE: 'asset_provisioning:approve',
  ALL: 'asset_provisioning:*',
} as const;

export const PolicyAcknowledgementPermissions = {
  VIEW: 'policy_acknowledgement:view',
  CREATE: 'policy_acknowledgement:create',
  VERIFY: 'policy_acknowledgement:verify',
  GRANT_ACCESS: 'policy_acknowledgement:grant_access',
  ALL: 'policy_acknowledgement:*',
} as const;

export const ProbationPlanPermissions = {
  VIEW: 'probation_plan:view',
  CREATE: 'probation_plan:create',
  UPDATE: 'probation_plan:update',
  ENDORSE: 'probation_plan:endorse',
  ALL: 'probation_plan:*',
} as const;

export const ProbationEvaluationPermissions = {
  VIEW: 'probation_evaluation:view',
  CREATE: 'probation_evaluation:create',
  UPDATE: 'probation_evaluation:update',
  APPROVE: 'probation_evaluation:approve',
  ALL: 'probation_evaluation:*',
} as const;

export const ProbationConfirmationPermissions = {
  VIEW: 'probation_confirmation:view',
  CREATE: 'probation_confirmation:create',
  UPDATE: 'probation_confirmation:update',
  SIGN_OFF: 'probation_confirmation:sign_off',
  ALL: 'probation_confirmation:*',
} as const;

export const PerformancePermissions = {
  VIEW: 'performance:view',
  CREATE: 'performance:create',
  UPDATE_SELF: 'performance:update_self',
  UPDATE_MANAGER: 'performance:update_manager',
  UPDATE_FEEDBACK: 'performance:update_feedback',
  COMPLETE: 'performance:complete',
  VIEW_SUMMARY: 'performance:view_summary',
  MANAGE_PERIODS: 'performance:manage_periods',
  CALIBRATE: 'performance:calibrate',
  ALL: 'performance:*',
} as const;

export const OkrPermissions = {
  VIEW: 'okr:view',
  CREATE: 'okr:create',
  UPDATE: 'okr:update',
  UPDATE_KEY_RESULT: 'okr:update_key_result',
  VIEW_CHECKINS: 'okr:view_checkins',
  MANAGER_REVIEW: 'okr:manager_review',
  REWEIGHT: 'okr:reweight',
  ALL: 'okr:*',
} as const;

export const SuccessionPlanPermissions = {
  VIEW: 'succession_plan:view',
  CREATE: 'succession_plan:create',
  UPDATE: 'succession_plan:update',
  ALL: 'succession_plan:*',
} as const;

export const PromotionProposalPermissions = {
  VIEW: 'promotion_proposal:view',
  CREATE: 'promotion_proposal:create',
  REVIEW: 'promotion_proposal:review',
  ALL: 'promotion_proposal:*',
} as const;

export const TrainingPermissions = {
  VIEW: 'training:view',
  CREATE: 'training:create',
  APPROVE: 'training:approve',
  MANAGE_SKILLS: 'training:manage_skills',
  MANAGE_BUDGET: 'training:manage_budget',
  SKILL_GAP: 'training:skill_gap',
  ASSESS_NEEDS: 'training:assess_needs',
  ALL: 'training:*',
} as const;

export const TrainingFeedbackPermissions = {
  VIEW: 'training_feedback:view',
  CREATE: 'training_feedback:create',
  MANAGE: 'training_feedback:manage',
  ALL: 'training_feedback:*',
} as const;

export const TrainingAnalyticsPermissions = {
  VIEW: 'training_analytics:view',
  ROI: 'training_analytics:roi',
  REPORT: 'training_analytics:report',
  ALL: 'training_analytics:*',
} as const;

export const CertificationPermissions = {
  VIEW: 'certification:view',
  CREATE: 'certification:create',
  UPDATE: 'certification:update',
  RENEW: 'certification:renew',
  ALL: 'certification:*',
} as const;

export const TrainingCompliancePermissions = {
  VIEW: 'training_compliance:view',
  AUDIT: 'training_compliance:audit',
  REPORT: 'training_compliance:report',
  ALL: 'training_compliance:*',
} as const;

export const CareerDevelopmentPermissions = {
  VIEW: 'career_development:view',
  CREATE: 'career_development:create',
  UPDATE: 'career_development:update',
  MANAGE: 'career_development:manage',
  ALL: 'career_development:*',
} as const;

export const InternalTransferPermissions = {
  VIEW: 'internal_transfer:view',
  CREATE: 'internal_transfer:create',
  UPDATE: 'internal_transfer:update',
  APPROVE: 'internal_transfer:approve',
  REJECT: 'internal_transfer:reject',
  ALL: 'internal_transfer:*',
} as const;

export const SalaryAdjustmentPermissions = {
  VIEW: 'salary_adjustment:view',
  CREATE: 'salary_adjustment:create',
  UPDATE: 'salary_adjustment:update',
  APPROVE: 'salary_adjustment:approve',
  REJECT: 'salary_adjustment:reject',
  ALL: 'salary_adjustment:*',
} as const;

export const RelationsPermissions = {
  VIEW: 'relations:view',
  CREATE: 'relations:create',
  UPDATE: 'relations:update',
  APPROVE: 'relations:approve',
  RESPOND: 'relations:respond',
  RESULTS: 'relations:results',
  ALL: 'relations:*',
} as const;

export const OffboardingPermissions = {
  VIEW: 'offboarding:view',
  CREATE: 'offboarding:create',
  UPDATE: 'offboarding:update',
  APPROVE: 'offboarding:approve',
  COMPLETE: 'offboarding:complete',
  ALL: 'offboarding:*',
} as const;

export const PermissionGroups = {
  user: UserPermissions,
  user_profile: UserProfilePermissions,
  user_employment: UserEmploymentPermissions,
  user_compensation: UserCompensationPermissions,
  user_lifecycle: UserLifecyclePermissions,
  department: DepartmentPermissions,
  position: PositionPermissions,
  job_grade: JobGradePermissions,
  employee: EmployeePermissions,
  leave: LeavePermissions,
  attendance: AttendancePermissions,
  attendance_correction: AttendanceCorrectionPermissions,
  overtime: OvertimePermissions,
  flex_work: FlexWorkPermissions,
  punctuality: PunctualityPermissions,
  timesheet: TimesheetPermissions,
  attendance_report: AttendanceReportPermissions,
  hr_payroll: HrPayrollPermissions,
  invoice: InvoicePermissions,
  expense: ExpensePermissions,
  finance_report: FinanceReportPermissions,
  project: ProjectPermissions,
  task: TaskPermissions,
  crm_client: CrmClientPermissions,
  deal: DealPermissions,
  pipeline: PipelinePermissions,
  brain_config: BrainConfigPermissions,
  job: JobPermissions,
  job_approval: JobApprovalPermissions,
  candidate: CandidatePermissions,
  job_application: JobApplicationPermissions,
  interview: InterviewPermissions,
  onboarding_checklist: OnboardingChecklistPermissions,
  asset_provisioning: AssetProvisioningPermissions,
  policy_acknowledgement: PolicyAcknowledgementPermissions,
  probation_plan: ProbationPlanPermissions,
  probation_evaluation: ProbationEvaluationPermissions,
  probation_confirmation: ProbationConfirmationPermissions,
  performance: PerformancePermissions,
  okr: OkrPermissions,
  succession_plan: SuccessionPlanPermissions,
  promotion_proposal: PromotionProposalPermissions,
  training: TrainingPermissions,
  training_feedback: TrainingFeedbackPermissions,
  training_analytics: TrainingAnalyticsPermissions,
  certification: CertificationPermissions,
  training_compliance: TrainingCompliancePermissions,
  career_development: CareerDevelopmentPermissions,
  internal_transfer: InternalTransferPermissions,
  salary_adjustment: SalaryAdjustmentPermissions,
  relations: RelationsPermissions,
  offboarding: OffboardingPermissions,
  system_role: SystemRolePermissions,
  system_permission: SystemPermissionPermissions,
  system_resource: SystemResourcePermissions,
  system_notification: SystemNotificationPermissions,
  system_audit: SystemAuditPermissions,
  system_config: SystemConfigPermissions,
  system_log: SystemLogPermissions,
} as const;

type ValueOf<T> = T[keyof T];
type PermissionGroupMap = typeof PermissionGroups;

export type PermissionSlug = {
  [K in keyof PermissionGroupMap]: ValueOf<PermissionGroupMap[K]>;
}[keyof PermissionGroupMap];

const permissionGroupValues = Object.values(PermissionGroups) as ReadonlyArray<
  Record<string, PermissionSlug>
>;

export const AllPermissionSlugs = [
  ...new Set(permissionGroupValues.flatMap((group) => Object.values(group))),
] as PermissionSlug[];
