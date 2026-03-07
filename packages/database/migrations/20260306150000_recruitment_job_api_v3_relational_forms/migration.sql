-- Recruitment Job API V3
-- - Nested-only relational form model (request/details/application)
-- - Lifecycle status remodel
-- - Standalone Finance/GM/HR stage statuses
-- - Salary mode enum (without RANGE)

-- CreateEnum
CREATE TYPE "JobStageApprovalStatus" AS ENUM ('PENDING_FOR_APPROVAL', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "JobSalaryMode" AS ENUM ('NOT_SPECIFIED', 'NEGOTIABLE', 'COMPETITIVE');

-- CreateEnum
CREATE TYPE "JobRequestType" AS ENUM ('NEW', 'REPLACEMENT');

-- CreateEnum
CREATE TYPE "JobUrgency" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "JobApplicationFieldType" AS ENUM ('TEXT', 'TEXTAREA', 'NUMBER', 'SELECT', 'FILE', 'DATE', 'CHECKBOX');

-- CreateEnum
CREATE TYPE "JobPredefinedFieldKey" AS ENUM (
  'FULL_NAME',
  'EMAIL',
  'PHONE',
  'RESUME',
  'COVER_LETTER',
  'LINKEDIN',
  'PORTFOLIO',
  'GITHUB',
  'CURRENT_COMPANY',
  'CURRENT_POSITION',
  'YEARS_EXPERIENCE'
);

-- AlterEnum
BEGIN;
CREATE TYPE "JobWorkflowStatus_new" AS ENUM (
  'DRAFT',
  'PENDING_FOR_APPROVAL',
  'READY_TO_POST',
  'PUBLISHED',
  'CLOSED',
  'REJECTED'
);

ALTER TABLE "public"."Job"
  ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "Job"
  ALTER COLUMN "status" TYPE "JobWorkflowStatus_new"
  USING (
    CASE
      WHEN "status"::text IN ('PENDING_FINANCE', 'PENDING_GM', 'PENDING_HR_REVIEW')
        THEN 'PENDING_FOR_APPROVAL'
      WHEN "status"::text = 'APPROVED'
        THEN 'READY_TO_POST'
      WHEN "status"::text = 'CANCELLED'
        THEN 'REJECTED'
      ELSE "status"::text
    END::"JobWorkflowStatus_new"
  );

ALTER TYPE "JobWorkflowStatus" RENAME TO "JobWorkflowStatus_old";
ALTER TYPE "JobWorkflowStatus_new" RENAME TO "JobWorkflowStatus";
DROP TYPE "public"."JobWorkflowStatus_old";

ALTER TABLE "Job"
  ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- AlterTable
ALTER TABLE "Job"
  ADD COLUMN "finance_approval_status" "JobStageApprovalStatus" NOT NULL DEFAULT 'PENDING_FOR_APPROVAL',
  ADD COLUMN "gm_approval_status" "JobStageApprovalStatus" NOT NULL DEFAULT 'PENDING_FOR_APPROVAL',
  ADD COLUMN "hr_approval_status" "JobStageApprovalStatus" NOT NULL DEFAULT 'PENDING_FOR_APPROVAL',
  ADD COLUMN "salary_mode" "JobSalaryMode" NOT NULL DEFAULT 'NOT_SPECIFIED';

-- Backfill stage statuses from approval records with lifecycle fallback.
UPDATE "Job" AS j
SET
  "finance_approval_status" = COALESCE(
    (
      SELECT CASE ja."decision"
        WHEN 'APPROVED' THEN 'APPROVED'::"JobStageApprovalStatus"
        WHEN 'REJECTED' THEN 'REJECTED'::"JobStageApprovalStatus"
        ELSE 'PENDING_FOR_APPROVAL'::"JobStageApprovalStatus"
      END
      FROM "JobApproval" ja
      WHERE ja."job_id" = j."id" AND ja."stage" = 'FINANCE'
      LIMIT 1
    ),
    CASE
      WHEN j."status" IN ('READY_TO_POST', 'PUBLISHED', 'CLOSED') THEN 'APPROVED'::"JobStageApprovalStatus"
      WHEN j."status" = 'REJECTED' THEN 'REJECTED'::"JobStageApprovalStatus"
      ELSE 'PENDING_FOR_APPROVAL'::"JobStageApprovalStatus"
    END
  ),
  "gm_approval_status" = COALESCE(
    (
      SELECT CASE ja."decision"
        WHEN 'APPROVED' THEN 'APPROVED'::"JobStageApprovalStatus"
        WHEN 'REJECTED' THEN 'REJECTED'::"JobStageApprovalStatus"
        ELSE 'PENDING_FOR_APPROVAL'::"JobStageApprovalStatus"
      END
      FROM "JobApproval" ja
      WHERE ja."job_id" = j."id" AND ja."stage" = 'GM'
      LIMIT 1
    ),
    CASE
      WHEN j."status" IN ('READY_TO_POST', 'PUBLISHED', 'CLOSED') THEN 'APPROVED'::"JobStageApprovalStatus"
      WHEN j."status" = 'REJECTED' THEN 'REJECTED'::"JobStageApprovalStatus"
      ELSE 'PENDING_FOR_APPROVAL'::"JobStageApprovalStatus"
    END
  ),
  "hr_approval_status" = COALESCE(
    (
      SELECT CASE ja."decision"
        WHEN 'APPROVED' THEN 'APPROVED'::"JobStageApprovalStatus"
        WHEN 'REJECTED' THEN 'REJECTED'::"JobStageApprovalStatus"
        ELSE 'PENDING_FOR_APPROVAL'::"JobStageApprovalStatus"
      END
      FROM "JobApproval" ja
      WHERE ja."job_id" = j."id" AND ja."stage" = 'HR_REVIEW'
      LIMIT 1
    ),
    CASE
      WHEN j."status" IN ('READY_TO_POST', 'PUBLISHED', 'CLOSED') THEN 'APPROVED'::"JobStageApprovalStatus"
      WHEN j."status" = 'REJECTED' THEN 'REJECTED'::"JobStageApprovalStatus"
      ELSE 'PENDING_FOR_APPROVAL'::"JobStageApprovalStatus"
    END
  );

-- CreateTable
CREATE TABLE "JobRequestForm" (
  "id" UUID NOT NULL,
  "job_id" UUID NOT NULL,
  "job_title" TEXT NOT NULL,
  "department_id" UUID NOT NULL,
  "requested_by" VARCHAR(255) NOT NULL,
  "position_id" UUID NOT NULL,
  "request_type" "JobRequestType" NOT NULL,
  "replace_for" VARCHAR(255),
  "business_justification" TEXT NOT NULL,
  "employment_type" "EmploymentType" NOT NULL,
  "work_mode" "WorkLocationType" NOT NULL,
  "urgency" "JobUrgency" NOT NULL,
  "needed_by_date" DATE NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "JobRequestForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobDetailsForm" (
  "id" UUID NOT NULL,
  "request_form_id" UUID NOT NULL,
  "job_title" TEXT NOT NULL,
  "location" VARCHAR(255) NOT NULL,
  "work_mode" "WorkLocationType" NOT NULL,
  "employment_type" "EmploymentType" NOT NULL,
  "job_summary" TEXT NOT NULL,
  "why_join_us" TEXT,
  "key_responsibilities" TEXT NOT NULL,
  "preferred_skills" TEXT,
  "experience_level" "ExperienceLevel" NOT NULL,
  "salary_min" DECIMAL(12, 2),
  "salary_max" DECIMAL(12, 2),
  "salary_currency" VARCHAR(8),
  "salary_mode" "JobSalaryMode" NOT NULL DEFAULT 'NOT_SPECIFIED',
  "benefits" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "openings" INTEGER NOT NULL DEFAULT 1,
  "application_deadline" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "JobDetailsForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobDetailSkill" (
  "id" UUID NOT NULL,
  "job_details_form_id" UUID NOT NULL,
  "name" VARCHAR(128) NOT NULL,
  "level" "SkillLevel",
  "required" BOOLEAN NOT NULL DEFAULT true,
  "order" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "JobDetailSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobApplicationForm" (
  "id" UUID NOT NULL,
  "job_details_form_id" UUID NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "JobApplicationForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobApplicationPredefinedField" (
  "id" UUID NOT NULL,
  "job_application_form_id" UUID NOT NULL,
  "key" "JobPredefinedFieldKey" NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "required" BOOLEAN NOT NULL DEFAULT false,
  "order" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "JobApplicationPredefinedField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobApplicationCustomField" (
  "id" UUID NOT NULL,
  "job_application_form_id" UUID NOT NULL,
  "custom_field_id" VARCHAR(64) NOT NULL,
  "label" VARCHAR(255) NOT NULL,
  "type" "JobApplicationFieldType" NOT NULL,
  "required" BOOLEAN NOT NULL DEFAULT false,
  "help_text" TEXT,
  "order" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "JobApplicationCustomField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobApplicationCustomFieldOption" (
  "id" UUID NOT NULL,
  "custom_field_row_id" UUID NOT NULL,
  "value" VARCHAR(255) NOT NULL,
  "order" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "JobApplicationCustomFieldOption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JobRequestForm_job_id_key" ON "JobRequestForm"("job_id");

-- CreateIndex
CREATE INDEX "JobRequestForm_department_id_idx" ON "JobRequestForm"("department_id");

-- CreateIndex
CREATE INDEX "JobRequestForm_position_id_idx" ON "JobRequestForm"("position_id");

-- CreateIndex
CREATE UNIQUE INDEX "JobDetailsForm_request_form_id_key" ON "JobDetailsForm"("request_form_id");

-- CreateIndex
CREATE INDEX "JobDetailSkill_job_details_form_id_idx" ON "JobDetailSkill"("job_details_form_id");

-- CreateIndex
CREATE INDEX "JobDetailSkill_job_details_form_id_order_idx" ON "JobDetailSkill"("job_details_form_id", "order");

-- CreateIndex
CREATE UNIQUE INDEX "JobApplicationForm_job_details_form_id_key" ON "JobApplicationForm"("job_details_form_id");

-- CreateIndex
CREATE INDEX "JobApplicationPredefinedField_job_application_form_id_idx" ON "JobApplicationPredefinedField"("job_application_form_id");

-- CreateIndex
CREATE INDEX "JobApplicationPredefinedField_job_application_form_id_order_idx" ON "JobApplicationPredefinedField"("job_application_form_id", "order");

-- CreateIndex
CREATE UNIQUE INDEX "JobApplicationPredefinedField_job_application_form_id_key_key" ON "JobApplicationPredefinedField"("job_application_form_id", "key");

-- CreateIndex
CREATE INDEX "JobApplicationCustomField_job_application_form_id_idx" ON "JobApplicationCustomField"("job_application_form_id");

-- CreateIndex
CREATE INDEX "JobApplicationCustomField_job_application_form_id_order_idx" ON "JobApplicationCustomField"("job_application_form_id", "order");

-- CreateIndex
CREATE UNIQUE INDEX "JobApplicationCustomField_job_application_form_id_custom_fi_key" ON "JobApplicationCustomField"("job_application_form_id", "custom_field_id");

-- CreateIndex
CREATE INDEX "JobApplicationCustomFieldOption_custom_field_row_id_idx" ON "JobApplicationCustomFieldOption"("custom_field_row_id");

-- CreateIndex
CREATE INDEX "JobApplicationCustomFieldOption_custom_field_row_id_order_idx" ON "JobApplicationCustomFieldOption"("custom_field_row_id", "order");

-- CreateIndex
CREATE INDEX "Job_finance_approval_status_idx" ON "Job"("finance_approval_status");

-- CreateIndex
CREATE INDEX "Job_gm_approval_status_idx" ON "Job"("gm_approval_status");

-- CreateIndex
CREATE INDEX "Job_hr_approval_status_idx" ON "Job"("hr_approval_status");

-- AddForeignKey
ALTER TABLE "JobRequestForm"
  ADD CONSTRAINT "JobRequestForm_job_id_fkey"
  FOREIGN KEY ("job_id") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobRequestForm"
  ADD CONSTRAINT "JobRequestForm_department_id_fkey"
  FOREIGN KEY ("department_id") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobRequestForm"
  ADD CONSTRAINT "JobRequestForm_position_id_fkey"
  FOREIGN KEY ("position_id") REFERENCES "Position"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobDetailsForm"
  ADD CONSTRAINT "JobDetailsForm_request_form_id_fkey"
  FOREIGN KEY ("request_form_id") REFERENCES "JobRequestForm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobDetailSkill"
  ADD CONSTRAINT "JobDetailSkill_job_details_form_id_fkey"
  FOREIGN KEY ("job_details_form_id") REFERENCES "JobDetailsForm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplicationForm"
  ADD CONSTRAINT "JobApplicationForm_job_details_form_id_fkey"
  FOREIGN KEY ("job_details_form_id") REFERENCES "JobDetailsForm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplicationPredefinedField"
  ADD CONSTRAINT "JobApplicationPredefinedField_job_application_form_id_fkey"
  FOREIGN KEY ("job_application_form_id") REFERENCES "JobApplicationForm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplicationCustomField"
  ADD CONSTRAINT "JobApplicationCustomField_job_application_form_id_fkey"
  FOREIGN KEY ("job_application_form_id") REFERENCES "JobApplicationForm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplicationCustomFieldOption"
  ADD CONSTRAINT "JobApplicationCustomFieldOption_custom_field_row_id_fkey"
  FOREIGN KEY ("custom_field_row_id") REFERENCES "JobApplicationCustomField"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill request forms from existing Job rows.
INSERT INTO "JobRequestForm" (
  "id",
  "job_id",
  "job_title",
  "department_id",
  "requested_by",
  "position_id",
  "request_type",
  "replace_for",
  "business_justification",
  "employment_type",
  "work_mode",
  "urgency",
  "needed_by_date",
  "createdAt",
  "updatedAt"
)
SELECT
  j."id",
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
  COALESCE(NULLIF(j."summary", ''), NULLIF(j."description", ''), 'Legacy job backfill'),
  COALESCE(j."employment_type", 'FULL_TIME'::"EmploymentType"),
  j."work_location_type",
  'MEDIUM'::"JobUrgency",
  COALESCE(j."application_deadline"::date, (CURRENT_DATE + INTERVAL '30 days')::date),
  j."createdAt",
  j."updatedAt"
FROM "Job" j
LEFT JOIN "User" u ON u."id" = j."created_by_id"
LEFT JOIN "JobRequestForm" rf ON rf."job_id" = j."id"
WHERE rf."id" IS NULL;

-- Backfill details forms from request forms / job rows.
INSERT INTO "JobDetailsForm" (
  "id",
  "request_form_id",
  "job_title",
  "location",
  "work_mode",
  "employment_type",
  "job_summary",
  "why_join_us",
  "key_responsibilities",
  "preferred_skills",
  "experience_level",
  "salary_min",
  "salary_max",
  "salary_currency",
  "salary_mode",
  "benefits",
  "openings",
  "application_deadline",
  "createdAt",
  "updatedAt"
)
SELECT
  rf."id",
  rf."id",
  rf."job_title",
  COALESCE(
    NULLIF(TRIM(BOTH ', ' FROM CONCAT_WS(', ', j."city", j."country")), ''),
    'Not specified'
  ),
  rf."work_mode",
  rf."employment_type",
  j."description",
  j."summary",
  COALESCE(
    NULLIF(
      (
        SELECT string_agg(
          jr."description",
          E'\n'
          ORDER BY COALESCE(jr."order", 2147483647), jr."createdAt"
        )
        FROM "JobResponsibility" jr
        WHERE jr."job_id" = j."id"
      ),
      ''
    ),
    j."description"
  ),
  NULLIF(
    (
      SELECT string_agg(
        js."name",
        E'\n'
        ORDER BY COALESCE(js."order", 2147483647), js."createdAt"
      )
      FROM "JobSkill" js
      WHERE js."job_id" = j."id" AND js."required" = false
    ),
    ''
  ),
  COALESCE(j."experience_level", 'MID'::"ExperienceLevel"),
  j."salary_min",
  j."salary_max",
  j."currency",
  j."salary_mode",
  j."benefits",
  j."openings",
  COALESCE(j."application_deadline", j."createdAt" + INTERVAL '30 days'),
  j."createdAt",
  j."updatedAt"
FROM "JobRequestForm" rf
JOIN "Job" j ON j."id" = rf."job_id"
LEFT JOIN "JobDetailsForm" df ON df."request_form_id" = rf."id"
WHERE df."id" IS NULL;

-- Backfill application forms (empty field sets by default).
INSERT INTO "JobApplicationForm" (
  "id",
  "job_details_form_id",
  "createdAt",
  "updatedAt"
)
SELECT
  df."id",
  df."id",
  df."createdAt",
  df."updatedAt"
FROM "JobDetailsForm" df
LEFT JOIN "JobApplicationForm" af ON af."job_details_form_id" = df."id"
WHERE af."id" IS NULL;

-- Backfill structured skills from existing JobSkill rows.
INSERT INTO "JobDetailSkill" (
  "id",
  "job_details_form_id",
  "name",
  "level",
  "required",
  "order",
  "createdAt",
  "updatedAt"
)
SELECT
  js."id",
  df."id",
  js."name",
  js."level",
  js."required",
  js."order",
  js."createdAt",
  js."updatedAt"
FROM "JobSkill" js
JOIN "JobRequestForm" rf ON rf."job_id" = js."job_id"
JOIN "JobDetailsForm" df ON df."request_form_id" = rf."id"
LEFT JOIN "JobDetailSkill" ds ON ds."id" = js."id"
WHERE ds."id" IS NULL;
