-- Recruitment API refactor:
-- - remove JobDetailsForm and make JobApplicationForm standalone by job_id
-- - replace relational JobTool table with Job.tools text[]

-- 1) JobApplicationForm: add job_id + former JobDetailsForm columns
ALTER TABLE "JobApplicationForm"
  ADD COLUMN IF NOT EXISTS "job_id" UUID,
  ADD COLUMN IF NOT EXISTS "job_title" TEXT,
  ADD COLUMN IF NOT EXISTS "location" VARCHAR(255),
  ADD COLUMN IF NOT EXISTS "work_mode" "WorkLocationType",
  ADD COLUMN IF NOT EXISTS "employment_type" "EmploymentType",
  ADD COLUMN IF NOT EXISTS "job_summary" JSONB,
  ADD COLUMN IF NOT EXISTS "why_join_us" JSONB,
  ADD COLUMN IF NOT EXISTS "required_skills" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "preferred_skills" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "responsibilities" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "experience_level" "ExperienceLevel",
  ADD COLUMN IF NOT EXISTS "salary_min" DECIMAL(12,2),
  ADD COLUMN IF NOT EXISTS "salary_max" DECIMAL(12,2),
  ADD COLUMN IF NOT EXISTS "salary_currency" VARCHAR(8),
  ADD COLUMN IF NOT EXISTS "salary_mode" "JobSalaryMode" NOT NULL DEFAULT 'NOT_SPECIFIED',
  ADD COLUMN IF NOT EXISTS "benefits" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "openings" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS "application_deadline" TIMESTAMP(3);

-- 2) Backfill JobApplicationForm.job_id from prior JobDetailsForm chain
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'JobApplicationForm'
      AND column_name = 'job_details_form_id'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'JobDetailsForm'
  ) THEN
    UPDATE "JobApplicationForm" jaf
    SET "job_id" = jrf."job_id"
    FROM "JobDetailsForm" jdf
    JOIN "JobRequestForm" jrf ON jrf."id" = jdf."request_form_id"
    WHERE jaf."job_details_form_id" = jdf."id"
      AND jaf."job_id" IS NULL;
  END IF;
END $$;

-- 3) Backfill former details fields from JobDetailsForm, then from Job fallback if needed
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'JobDetailsForm'
  ) THEN
    UPDATE "JobApplicationForm" jaf
    SET
      "job_title" = COALESCE(jaf."job_title", jdf."job_title"),
      "location" = COALESCE(jaf."location", jdf."location"),
      "work_mode" = COALESCE(jaf."work_mode", jdf."work_mode"),
      "employment_type" = COALESCE(jaf."employment_type", jdf."employment_type"),
      "job_summary" = COALESCE(jaf."job_summary", jdf."job_summary"),
      "why_join_us" = COALESCE(jaf."why_join_us", jdf."why_join_us"),
      "required_skills" = COALESCE(jaf."required_skills", jdf."required_skills", ARRAY[]::TEXT[]),
      "preferred_skills" = COALESCE(jaf."preferred_skills", jdf."preferred_skills", ARRAY[]::TEXT[]),
      "responsibilities" = COALESCE(jaf."responsibilities", jdf."responsibilities", ARRAY[]::TEXT[]),
      "experience_level" = COALESCE(jaf."experience_level", jdf."experience_level"),
      "salary_min" = COALESCE(jaf."salary_min", jdf."salary_min"),
      "salary_max" = COALESCE(jaf."salary_max", jdf."salary_max"),
      "salary_currency" = COALESCE(jaf."salary_currency", jdf."salary_currency"),
      "salary_mode" = COALESCE(jaf."salary_mode", jdf."salary_mode", 'NOT_SPECIFIED'),
      "benefits" = COALESCE(jaf."benefits", jdf."benefits", ARRAY[]::TEXT[]),
      "openings" = COALESCE(jaf."openings", jdf."openings", 1),
      "application_deadline" = COALESCE(jaf."application_deadline", jdf."application_deadline")
    FROM "JobDetailsForm" jdf
    WHERE jaf."job_details_form_id" = jdf."id";
  END IF;
END $$;

UPDATE "JobApplicationForm" jaf
SET
  "job_title" = COALESCE(jaf."job_title", j."title"),
  "work_mode" = COALESCE(jaf."work_mode", j."work_location_type"),
  "employment_type" = COALESCE(jaf."employment_type", j."employment_type", 'FULL_TIME'),
  "job_summary" = COALESCE(jaf."job_summary", j."description"),
  "why_join_us" = COALESCE(jaf."why_join_us", j."summary"),
  "required_skills" = COALESCE(jaf."required_skills", j."required_skills", ARRAY[]::TEXT[]),
  "preferred_skills" = COALESCE(jaf."preferred_skills", j."preferred_skills", ARRAY[]::TEXT[]),
  "responsibilities" = COALESCE(jaf."responsibilities", j."responsibilities", ARRAY[]::TEXT[]),
  "experience_level" = COALESCE(jaf."experience_level", j."experience_level", 'MID'),
  "salary_min" = COALESCE(jaf."salary_min", j."salary_min"),
  "salary_max" = COALESCE(jaf."salary_max", j."salary_max"),
  "salary_currency" = COALESCE(jaf."salary_currency", j."currency"),
  "salary_mode" = COALESCE(jaf."salary_mode", j."salary_mode", 'NOT_SPECIFIED'),
  "benefits" = COALESCE(jaf."benefits", j."benefits", ARRAY[]::TEXT[]),
  "openings" = COALESCE(jaf."openings", j."openings", 1),
  "application_deadline" = COALESCE(jaf."application_deadline", j."application_deadline", NOW())
FROM "Job" j
WHERE jaf."job_id" = j."id";

-- Ensure required fields are populated
UPDATE "JobApplicationForm"
SET "location" = COALESCE("location", 'Unspecified')
WHERE "location" IS NULL;

UPDATE "JobApplicationForm"
SET "application_deadline" = COALESCE("application_deadline", NOW())
WHERE "application_deadline" IS NULL;

-- Enforce new one-to-one shape and constraints
ALTER TABLE "JobApplicationForm"
  ALTER COLUMN "job_id" SET NOT NULL,
  ALTER COLUMN "job_title" SET NOT NULL,
  ALTER COLUMN "location" SET NOT NULL,
  ALTER COLUMN "work_mode" SET NOT NULL,
  ALTER COLUMN "employment_type" SET NOT NULL,
  ALTER COLUMN "job_summary" SET NOT NULL,
  ALTER COLUMN "experience_level" SET NOT NULL,
  ALTER COLUMN "application_deadline" SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'JobApplicationForm_job_id_fkey'
  ) THEN
    ALTER TABLE "JobApplicationForm"
      ADD CONSTRAINT "JobApplicationForm_job_id_fkey"
      FOREIGN KEY ("job_id") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "JobApplicationForm_job_id_key"
  ON "JobApplicationForm"("job_id");

-- Remove old JobDetailsForm pointer from JobApplicationForm
ALTER TABLE "JobApplicationForm"
  DROP CONSTRAINT IF EXISTS "JobApplicationForm_job_details_form_id_fkey";

DROP INDEX IF EXISTS "JobApplicationForm_job_details_form_id_key";

ALTER TABLE "JobApplicationForm"
  DROP COLUMN IF EXISTS "job_details_form_id";

-- 4) Job.tools text[] + backfill from JobTool table
ALTER TABLE "Job"
  ADD COLUMN IF NOT EXISTS "tools" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'JobTool'
  ) THEN
    UPDATE "Job" j
    SET "tools" = src.tools
    FROM (
      SELECT
        jt."job_id",
        array_agg(jt."name" ORDER BY COALESCE(jt."order", 2147483647), jt."createdAt") AS tools
      FROM "JobTool" jt
      GROUP BY jt."job_id"
    ) src
    WHERE j."id" = src."job_id"
      AND COALESCE(array_length(j."tools", 1), 0) = 0;
  END IF;
END $$;

-- 5) Drop deprecated tables
DROP TABLE IF EXISTS "JobTool" CASCADE;
DROP TABLE IF EXISTS "JobDetailsForm" CASCADE;
