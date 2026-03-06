-- Remove legacy CANCELLED state from JobWorkflowStatus
UPDATE "Job"
SET "status" = 'REJECTED'
WHERE "status" = 'CANCELLED';

ALTER TYPE "JobWorkflowStatus" RENAME TO "JobWorkflowStatus_old";

CREATE TYPE "JobWorkflowStatus" AS ENUM (
  'DRAFT',
  'PENDING_FINANCE',
  'PENDING_GM',
  'PENDING_HR_REVIEW',
  'APPROVED',
  'PUBLISHED',
  'CLOSED',
  'REJECTED'
);

ALTER TABLE "Job"
  ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" TYPE "JobWorkflowStatus"
  USING ("status"::text::"JobWorkflowStatus"),
  ALTER COLUMN "status" SET DEFAULT 'DRAFT';

DROP TYPE "JobWorkflowStatus_old";
