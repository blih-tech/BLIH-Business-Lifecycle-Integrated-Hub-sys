/**
 * Canonical role-to-permission mapping used as a hardcoded fallback when the
 * database has no RolePermission rows (e.g. unseeded DB, partial seed, or
 * first-time auto-provisioning of a Keycloak realm role).
 *
 * Rules:
 *  - Keys must exactly match the lowercase role names in RBAC_ROLE_NAMES.
 *  - Values use the resource:action slug format, with `*` as a wildcard action.
 *  - Only actual resources in RBAC_RESOURCE_CATALOG are referenced (no phantom
 *    resources like `finance:*` or `crm:*` that don't exist in the catalog).
 *  - This is the SINGLE SOURCE OF TRUTH — do not duplicate in the guard or
 *    snapshot service; import from here instead.
 */
export const ROLE_PERMISSION_BASELINE: Readonly<
  Record<string, readonly string[]>
> = {
  superadmin: ['*'],

  // ── HR domain ────────────────────────────────────────────────────────────
  hr: [
    // Core employee & org management
    'employee:*',
    'department:*',
    'position:*',
    'job_grade:*',
    // User account & profile management
    'user:*',
    'user_profile:*',
    'user_employment:*',
    'user_compensation:*',
    'user_lifecycle:*',
    // Leave & attendance
    'leave:*',
    'attendance:*',
    'attendance_correction:*',
    'overtime:*',
    'flex_work:*',
    'punctuality:*',
    'timesheet:*',
    'attendance_report:*',
    'hr_payroll:*',
    // Recruitment
    'job:*',
    'job_approval:*',
    'candidate:*',
    'applicant:*',
    'job_application:*',
    'interview:*',
    'offer:*',
    // Onboarding & probation
    'onboarding:*',
    'onboarding_task:*',
    'onboarding_checklist:*',
    'asset_provisioning:*',
    'policy_acknowledgement:*',
    'probation_plan:*',
    'probation_kpi:*',
    'probation_evaluation:*',
    'probation_confirmation:*',
    // Performance & OKR
    'performance:*',
    'okr:*',
    // Training & skills
    'training:*',
    'training_feedback:*',
    'training_analytics:*',
    'certification:*',
    'training_compliance:*',
    // Career & talent
    'career_development:*',
    'internal_transfer:*',
    'salary_adjustment:*',
    'succession_plan:*',
    'promotion_proposal:*',
    // Employee relations & offboarding
    'relations:*',
    'offboarding:*',
  ],

  hr_manager: [
    'employee:*',
    'department:*',
    'position:*',
    'job_grade:*',
    'user:*',
    'user_profile:*',
    'user_employment:*',
    'user_compensation:*',
    'user_lifecycle:*',
    'leave:*',
    'attendance:*',
    'attendance_correction:*',
    'overtime:*',
    'flex_work:*',
    'punctuality:*',
    'timesheet:*',
    'attendance_report:*',
    'hr_payroll:*',
    'job:*',
    'job_approval:*',
    'candidate:*',
    'applicant:*',
    'job_application:*',
    'interview:*',
    'offer:*',
    'onboarding:*',
    'onboarding_task:*',
    'onboarding_checklist:*',
    'asset_provisioning:*',
    'policy_acknowledgement:*',
    'probation_plan:*',
    'probation_kpi:*',
    'probation_evaluation:*',
    'probation_confirmation:*',
    'performance:*',
    'okr:*',
    'training:*',
    'training_feedback:*',
    'training_analytics:*',
    'certification:*',
    'training_compliance:*',
    'career_development:*',
    'internal_transfer:*',
    'salary_adjustment:*',
    'succession_plan:*',
    'promotion_proposal:*',
    'relations:*',
    'offboarding:*',
  ],

  hr_assistant: [
    'employee:view',
    'employee:create',
    'leave:view',
    'leave:create',
    'attendance:view',
    'attendance_correction:view',
    'overtime:view',
    'department:view',
    'position:view',
    'user_profile:view',
    'user_profile:update',
  ],

  // ── Finance domain ───────────────────────────────────────────────────────
  finance: ['invoice:*', 'expense:*', 'finance_report:*', 'hr_payroll:*'],

  finance_manager: [
    'invoice:*',
    'expense:*',
    'finance_report:*',
    'hr_payroll:*',
  ],

  finance_accountant: [
    'invoice:view',
    'invoice:create',
    'expense:view',
    'expense:create',
    'finance_report:view',
    'hr_payroll:view',
  ],

  // ── Project Management domain ─────────────────────────────────────────────
  project_manager: ['project:*', 'task:*'],

  pm_lead: [
    'project:view',
    'project:create',
    'task:view',
    'task:create',
    'task:assign',
  ],

  pm_member: ['project:view', 'task:view'],

  // ── CRM domain ───────────────────────────────────────────────────────────
  crm_manager: ['crm_client:*', 'deal:*', 'pipeline:view', 'pipeline:manage'],

  crm_lead: ['crm_client:*', 'deal:*', 'pipeline:view', 'pipeline:manage'],

  crm_agent: [
    'crm_client:view',
    'crm_client:create',
    'deal:view',
    'deal:create',
    'pipeline:view',
  ],

  // ── Brain / AI domain ────────────────────────────────────────────────────
  brain_operator: ['brain_config:*'],

  brain_admin: ['brain_config:*'],

  brain_viewer: ['brain_config:view'],
};

/**
 * Returns the merged baseline permissions for a set of (lowercased) role names.
 * Superadmin short-circuits to ['*'].
 */
export function buildBaselinePermissions(lowerRoleNames: string[]): string[] {
  if (lowerRoleNames.includes('superadmin')) {
    return ['*'];
  }

  const merged = new Set<string>();
  for (const role of lowerRoleNames) {
    const perms = ROLE_PERMISSION_BASELINE[role];
    if (perms) {
      for (const p of perms) {
        merged.add(p);
      }
    }
  }
  return [...merged];
}
