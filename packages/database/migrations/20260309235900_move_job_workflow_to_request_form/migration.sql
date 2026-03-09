-- Move recruitment workflow ownership from Job to JobRequestForm.
-- Applicant-facing posting content stays on Job.

ALTER TABLE "JobRequestForm"
  ADD COLUMN IF NOT EXISTS "status" "JobWorkflowStatus" NOT NULL DEFAULT 'DRAFT',
  ADD COLUMN IF NOT EXISTS "priority" "JobPriority" NOT NULL DEFAULT 'MEDIUM',
  ADD COLUMN IF NOT EXISTS "finance_approval_status" "JobStageApprovalStatus" NOT NULL DEFAULT 'PENDING_FOR_APPROVAL',
  ADD COLUMN IF NOT EXISTS "gm_approval_status" "JobStageApprovalStatus" NOT NULL DEFAULT 'PENDING_FOR_APPROVAL',
  ADD COLUMN IF NOT EXISTS "hr_approval_status" "JobStageApprovalStatus" NOT NULL DEFAULT 'PENDING_FOR_APPROVAL',
  ADD COLUMN IF NOT EXISTS "drafted_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "pending_approval_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "ready_to_post_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "rejected_at" TIMESTAMP(3);

INSERT INTO "JobRequestForm" (
  "id",
  "job_id",
  "job_title",
  "department_id",
  "requested_by",
  "position_id",
  "request_type",
  "replace_for_user_id",
  "business_justification",
  "employment_type",
  "work_mode",
  "urgency",
  "needed_by_date",
  "status",
  "priority",
  "finance_approval_status",
  "gm_approval_status",
  "hr_approval_status",
  "drafted_at",
  "pending_approval_at",
  "ready_to_post_at",
  "rejected_at",
  "createdAt",
  "updatedAt"
)
SELECT
  gen_random_uuid(),
  j."id",
  j."title",
  j."department_id",
  COALESCE(
    NULLIF(TRIM(CONCAT(COALESCE(u."firstName", ''), ' ', COALESCE(u."lastName", ''))), ''),
    'System'
  ),
  j."position_id",
  'NEW'::"JobRequestType",
  NULL,
  'Backfilled from legacy Job row',
  COALESCE(j."employment_type", 'FULL_TIME'::"EmploymentType"),
  j."work_location_type",
  'MEDIUM'::"JobUrgency",
  COALESCE(j."application_deadline"::date, (CURRENT_DATE + INTERVAL '30 days')::date),
  j."status",
  j."priority",
  j."finance_approval_status",
  j."gm_approval_status",
  j."hr_approval_status",
  j."drafted_at",
  j."pending_approval_at",
  j."ready_to_post_at",
  j."rejected_at",
  j."createdAt",
  j."updatedAt"
FROM "Job" j
LEFT JOIN "User" u ON u."id" = j."created_by_id"
LEFT JOIN "JobRequestForm" rf ON rf."job_id" = j."id"
WHERE rf."id" IS NULL;

UPDATE "JobRequestForm" rf
SET
  "status" = j."status",
  "priority" = j."priority",
  "finance_approval_status" = j."finance_approval_status",
  "gm_approval_status" = j."gm_approval_status",
  "hr_approval_status" = j."hr_approval_status",
  "drafted_at" = j."drafted_at",
  "pending_approval_at" = j."pending_approval_at",
  "ready_to_post_at" = j."ready_to_post_at",
  "rejected_at" = j."rejected_at"
FROM "Job" j
WHERE rf."job_id" = j."id";

CREATE INDEX IF NOT EXISTS "JobRequestForm_status_idx"
  ON "JobRequestForm"("status");
CREATE INDEX IF NOT EXISTS "JobRequestForm_finance_approval_status_idx"
  ON "JobRequestForm"("finance_approval_status");
CREATE INDEX IF NOT EXISTS "JobRequestForm_gm_approval_status_idx"
  ON "JobRequestForm"("gm_approval_status");
CREATE INDEX IF NOT EXISTS "JobRequestForm_hr_approval_status_idx"
  ON "JobRequestForm"("hr_approval_status");

DROP INDEX IF EXISTS "Job_status_idx";
DROP INDEX IF EXISTS "Job_finance_approval_status_idx";
DROP INDEX IF EXISTS "Job_gm_approval_status_idx";
DROP INDEX IF EXISTS "Job_hr_approval_status_idx";

ALTER TABLE "Job"
  DROP COLUMN IF EXISTS "status",
  DROP COLUMN IF EXISTS "priority",
  DROP COLUMN IF EXISTS "finance_approval_status",
  DROP COLUMN IF EXISTS "gm_approval_status",
  DROP COLUMN IF EXISTS "hr_approval_status",
  DROP COLUMN IF EXISTS "drafted_at",
  DROP COLUMN IF EXISTS "pending_approval_at",
  DROP COLUMN IF EXISTS "ready_to_post_at",
  DROP COLUMN IF EXISTS "rejected_at";
