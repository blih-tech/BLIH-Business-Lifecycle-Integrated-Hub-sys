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
} as const;

export const UserLifecyclePermissions = {
  VIEW: 'user_lifecycle:view',
  UPDATE: 'user_lifecycle:update',
} as const;

export const PositionPermissions = {
  VIEW: 'position:view',
  CREATE: 'position:create',
  UPDATE: 'position:update',
  DELETE: 'position:delete',
  ALL: 'position:*',
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

export const RecruitmentRequestPermissions = {
  VIEW: 'recruitment_request:view',
  CREATE: 'recruitment_request:create',
  UPDATE: 'recruitment_request:update',
  APPROVE: 'recruitment_request:approve',
  ALL: 'recruitment_request:*',
} as const;

export const JobPostingPermissions = {
  VIEW: 'job_posting:view',
  CREATE: 'job_posting:create',
  UPDATE: 'job_posting:update',
  PUBLISH: 'job_posting:publish',
  ALL: 'job_posting:*',
} as const;

export const CandidatePermissions = {
  VIEW: 'candidate:view',
  CREATE: 'candidate:create',
  UPDATE: 'candidate:update',
  SCREEN: 'candidate:screen',
  ALL: 'candidate:*',
} as const;

export const HiringDecisionPermissions = {
  VIEW: 'hiring_decision:view',
  CREATE: 'hiring_decision:create',
  APPROVE: 'hiring_decision:approve',
  ALL: 'hiring_decision:*',
} as const;

export const OnboardingChecklistPermissions = {
  VIEW: 'onboarding_checklist:view',
  CREATE: 'onboarding_checklist:create',
  UPDATE: 'onboarding_checklist:update',
  ALL: 'onboarding_checklist:*',
} as const;

export const PermissionGroups = {
  user: UserPermissions,
  user_profile: UserProfilePermissions,
  user_employment: UserEmploymentPermissions,
  user_compensation: UserCompensationPermissions,
  user_lifecycle: UserLifecyclePermissions,
  position: PositionPermissions,
  employee: EmployeePermissions,
  leave: LeavePermissions,
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
  recruitment_request: RecruitmentRequestPermissions,
  job_posting: JobPostingPermissions,
  candidate: CandidatePermissions,
  hiring_decision: HiringDecisionPermissions,
  onboarding_checklist: OnboardingChecklistPermissions,
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
