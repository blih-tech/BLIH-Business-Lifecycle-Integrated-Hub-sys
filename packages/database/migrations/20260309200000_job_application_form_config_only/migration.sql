-- JobApplicationForm -> configuration-only refactor
-- - keep Job as posting source of truth
-- - add standard applicant field configuration table
-- - backfill Job from JobApplicationForm only when Job fields are missing/default-like

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'JobApplicantFieldKey'
  ) THEN
    CREATE TYPE "JobApplicantFieldKey" AS ENUM (
      'FULL_NAME',
      'EMAIL',
      'PHONE',
      'RESUME_URL',
      'LINKEDIN_URL',
      'PORTFOLIO_URL',
      'GITHUB_URL',
      'CURRENT_COMPANY',
      'CURRENT_POSITION',
      'YEARS_EXPERIENCE',
      'LOCATION',
      'COUNTRY',
      'CITY',
      'NATIONALITY',
      'EXPECTED_SALARY',
      'CURRENT_SALARY',
      'EDUCATION_LEVEL',
      'HIGHEST_DEGREE',
      'SKILLS',
      'COVER_LETTER'
    );
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS "JobApplicationFormField" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "job_application_form_id" UUID NOT NULL,
  "key" "JobApplicantFieldKey" NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "required" BOOLEAN NOT NULL DEFAULT false,
  "order" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "JobApplicationFormField_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "JobApplicationFormField_job_application_form_id_key_key"
  ON "JobApplicationFormField"("job_application_form_id", "key");
CREATE INDEX IF NOT EXISTS "JobApplicationFormField_job_application_form_id_idx"
  ON "JobApplicationFormField"("job_application_form_id");
CREATE INDEX IF NOT EXISTS "JobApplicationFormField_job_application_form_id_order_idx"
  ON "JobApplicationFormField"("job_application_form_id", "order");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'JobApplicationFormField_job_application_form_id_fkey'
  ) THEN
    ALTER TABLE "JobApplicationFormField"
      ADD CONSTRAINT "JobApplicationFormField_job_application_form_id_fkey"
      FOREIGN KEY ("job_application_form_id") REFERENCES "JobApplicationForm"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;

-- Backfill Job from JobApplicationForm only where Job values are missing/default-like.
UPDATE "Job" j
SET
  "title" = CASE
    WHEN btrim(COALESCE(j."title", '')) = '' AND btrim(COALESCE(jaf."job_title", '')) <> ''
      THEN jaf."job_title"
    ELSE j."title"
  END,
  "summary" = CASE
    WHEN j."summary" IS NULL THEN jaf."why_join_us"
    ELSE j."summary"
  END,
  "employment_type" = COALESCE(j."employment_type", jaf."employment_type"),
  "experience_level" = COALESCE(j."experience_level", jaf."experience_level"),
  "salary_min" = COALESCE(j."salary_min", jaf."salary_min"),
  "salary_max" = COALESCE(j."salary_max", jaf."salary_max"),
  "currency" = COALESCE(j."currency", jaf."salary_currency"),
  "salary_mode" = CASE
    WHEN j."salary_mode" = 'NOT_SPECIFIED' AND jaf."salary_mode" IS NOT NULL
      THEN jaf."salary_mode"
    ELSE j."salary_mode"
  END,
  "benefits" = CASE
    WHEN COALESCE(array_length(j."benefits", 1), 0) = 0
      THEN COALESCE(jaf."benefits", ARRAY[]::TEXT[])
    ELSE j."benefits"
  END,
  "required_skills" = CASE
    WHEN COALESCE(array_length(j."required_skills", 1), 0) = 0
      THEN COALESCE(jaf."required_skills", ARRAY[]::TEXT[])
    ELSE j."required_skills"
  END,
  "preferred_skills" = CASE
    WHEN COALESCE(array_length(j."preferred_skills", 1), 0) = 0
      THEN COALESCE(jaf."preferred_skills", ARRAY[]::TEXT[])
    ELSE j."preferred_skills"
  END,
  "responsibilities" = CASE
    WHEN COALESCE(array_length(j."responsibilities", 1), 0) = 0
      THEN COALESCE(jaf."responsibilities", ARRAY[]::TEXT[])
    ELSE j."responsibilities"
  END,
  "openings" = CASE
    WHEN j."openings" = 1 AND jaf."openings" IS NOT NULL AND jaf."openings" > 0
      THEN jaf."openings"
    ELSE j."openings"
  END,
  "application_deadline" = COALESCE(j."application_deadline", jaf."application_deadline")
FROM "JobApplicationForm" jaf
WHERE jaf."job_id" = j."id";

-- Seed applicant field configuration defaults for each form.
INSERT INTO "JobApplicationFormField" (
  "job_application_form_id",
  "key",
  "enabled",
  "required",
  "order",
  "updatedAt"
)
SELECT
  jaf."id",
  cfg."key"::"JobApplicantFieldKey",
  cfg."enabled",
  cfg."required",
  cfg."order",
  NOW()
FROM "JobApplicationForm" jaf
CROSS JOIN (
  VALUES
    ('FULL_NAME', true, true, 1),
    ('EMAIL', true, true, 2),
    ('PHONE', true, false, 3),
    ('RESUME_URL', true, true, 4),
    ('LINKEDIN_URL', false, false, 5),
    ('PORTFOLIO_URL', false, false, 6),
    ('GITHUB_URL', false, false, 7),
    ('CURRENT_COMPANY', false, false, 8),
    ('CURRENT_POSITION', false, false, 9),
    ('YEARS_EXPERIENCE', false, false, 10),
    ('LOCATION', false, false, 11),
    ('COUNTRY', false, false, 12),
    ('CITY', false, false, 13),
    ('NATIONALITY', false, false, 14),
    ('EXPECTED_SALARY', false, false, 15),
    ('CURRENT_SALARY', false, false, 16),
    ('EDUCATION_LEVEL', false, false, 17),
    ('HIGHEST_DEGREE', false, false, 18),
    ('SKILLS', false, false, 19),
    ('COVER_LETTER', false, false, 20)
) AS cfg("key", "enabled", "required", "order")
ON CONFLICT ("job_application_form_id", "key") DO NOTHING;

-- Drop moved job-posting columns from JobApplicationForm.
ALTER TABLE "JobApplicationForm"
  DROP COLUMN IF EXISTS "job_title",
  DROP COLUMN IF EXISTS "location",
  DROP COLUMN IF EXISTS "work_mode",
  DROP COLUMN IF EXISTS "employment_type",
  DROP COLUMN IF EXISTS "job_summary",
  DROP COLUMN IF EXISTS "why_join_us",
  DROP COLUMN IF EXISTS "required_skills",
  DROP COLUMN IF EXISTS "responsibilities",
  DROP COLUMN IF EXISTS "preferred_skills",
  DROP COLUMN IF EXISTS "experience_level",
  DROP COLUMN IF EXISTS "salary_min",
  DROP COLUMN IF EXISTS "salary_max",
  DROP COLUMN IF EXISTS "salary_currency",
  DROP COLUMN IF EXISTS "salary_mode",
  DROP COLUMN IF EXISTS "benefits",
  DROP COLUMN IF EXISTS "openings",
  DROP COLUMN IF EXISTS "application_deadline";
