-- Recruitment completion alignment
-- 1) salary mode enum cleanup
-- 2) replacement user reference
-- 3) rich text json columns
-- 4) missing recruitment counters/timestamps
-- 5) candidate enterprise fields and history tables

-- Ensure salary mode no longer includes FIXED.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'JobSalaryMode' AND e.enumlabel = 'FIXED'
  ) THEN
    ALTER TABLE "Job" ALTER COLUMN "salary_mode" DROP DEFAULT;
    ALTER TABLE "JobDetailsForm" ALTER COLUMN "salary_mode" DROP DEFAULT;

    UPDATE "Job" SET "salary_mode" = 'NOT_SPECIFIED' WHERE "salary_mode"::text = 'FIXED';
    UPDATE "JobDetailsForm" SET "salary_mode" = 'NOT_SPECIFIED' WHERE "salary_mode"::text = 'FIXED';

    CREATE TYPE "JobSalaryMode_new" AS ENUM ('NOT_SPECIFIED', 'NEGOTIABLE', 'COMPETITIVE');

    ALTER TABLE "Job"
      ALTER COLUMN "salary_mode" TYPE "JobSalaryMode_new"
      USING ("salary_mode"::text::"JobSalaryMode_new");

    ALTER TABLE "JobDetailsForm"
      ALTER COLUMN "salary_mode" TYPE "JobSalaryMode_new"
      USING ("salary_mode"::text::"JobSalaryMode_new");

    ALTER TYPE "JobSalaryMode" RENAME TO "JobSalaryMode_old";
    ALTER TYPE "JobSalaryMode_new" RENAME TO "JobSalaryMode";
    DROP TYPE "JobSalaryMode_old";

    ALTER TABLE "Job" ALTER COLUMN "salary_mode" SET DEFAULT 'NOT_SPECIFIED';
    ALTER TABLE "JobDetailsForm" ALTER COLUMN "salary_mode" SET DEFAULT 'NOT_SPECIFIED';
  END IF;
END $$;

-- Job new columns (safe if already present).
ALTER TABLE "Job"
  ADD COLUMN IF NOT EXISTS "priority" "JobPriority" NOT NULL DEFAULT 'MEDIUM',
  ADD COLUMN IF NOT EXISTS "hiring_manager_id" UUID,
  ADD COLUMN IF NOT EXISTS "drafted_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "pending_approval_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "ready_to_post_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "closed_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "rejected_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "closing_reason" TEXT,
  ADD COLUMN IF NOT EXISTS "views_count" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "applications_count" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "shortlisted_count" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "interviews_count" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "offers_count" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "hires_count" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS "Job_hiring_manager_id_idx" ON "Job"("hiring_manager_id");
CREATE INDEX IF NOT EXISTS "Job_priority_idx" ON "Job"("priority");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'Job_hiring_manager_id_fkey'
  ) THEN
    ALTER TABLE "Job"
      ADD CONSTRAINT "Job_hiring_manager_id_fkey"
      FOREIGN KEY ("hiring_manager_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Convert Job description/summary from TEXT to JSONB when needed.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Job'
      AND column_name = 'description'
      AND udt_name <> 'jsonb'
  ) THEN
    ALTER TABLE "Job"
      ALTER COLUMN "description" TYPE JSONB
      USING CASE
        WHEN "description" IS NULL OR btrim("description") = '' THEN
          jsonb_build_object('type', 'doc', 'version', 1, 'content', '[]'::jsonb)
        ELSE
          jsonb_build_object(
            'type',
            'doc',
            'version',
            1,
            'content',
            jsonb_build_array(
              jsonb_build_object('type', 'paragraph', 'text', "description")
            )
          )
      END;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Job'
      AND column_name = 'summary'
      AND udt_name <> 'jsonb'
  ) THEN
    ALTER TABLE "Job"
      ALTER COLUMN "summary" TYPE JSONB
      USING CASE
        WHEN "summary" IS NULL OR btrim("summary") = '' THEN NULL
        ELSE
          jsonb_build_object(
            'type',
            'doc',
            'version',
            1,
            'content',
            jsonb_build_array(
              jsonb_build_object('type', 'paragraph', 'text', "summary")
            )
          )
      END;
  END IF;
END $$;

ALTER TABLE "Job"
  DROP COLUMN IF EXISTS "description_rich",
  DROP COLUMN IF EXISTS "summary_rich";

-- Convert JobDetailsForm rich text columns to JSONB.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'JobDetailsForm'
      AND column_name = 'job_summary'
      AND udt_name <> 'jsonb'
  ) THEN
    ALTER TABLE "JobDetailsForm"
      ALTER COLUMN "job_summary" TYPE JSONB
      USING CASE
        WHEN "job_summary" IS NULL OR btrim("job_summary") = '' THEN
          jsonb_build_object('type', 'doc', 'version', 1, 'content', '[]'::jsonb)
        ELSE
          jsonb_build_object(
            'type',
            'doc',
            'version',
            1,
            'content',
            jsonb_build_array(
              jsonb_build_object('type', 'paragraph', 'text', "job_summary")
            )
          )
      END;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'JobDetailsForm'
      AND column_name = 'why_join_us'
      AND udt_name <> 'jsonb'
  ) THEN
    ALTER TABLE "JobDetailsForm"
      ALTER COLUMN "why_join_us" TYPE JSONB
      USING CASE
        WHEN "why_join_us" IS NULL OR btrim("why_join_us") = '' THEN NULL
        ELSE
          jsonb_build_object(
            'type',
            'doc',
            'version',
            1,
            'content',
            jsonb_build_array(
              jsonb_build_object('type', 'paragraph', 'text', "why_join_us")
            )
          )
      END;
  END IF;
END $$;

-- Replace legacy replacement fields with user reference.
ALTER TABLE "JobRequestForm"
  ADD COLUMN IF NOT EXISTS "replace_for_user_id" UUID;

UPDATE "JobRequestForm" rf
SET "replace_for_user_id" = e."user_id"
FROM "Employee" e
WHERE rf."replace_for_user_id" IS NULL
  AND rf."replace_for_employee_id" IS NOT NULL
  AND rf."replace_for_employee_id" = e."id"
  AND e."user_id" IS NOT NULL;

CREATE INDEX IF NOT EXISTS "JobRequestForm_replace_for_user_id_idx"
  ON "JobRequestForm"("replace_for_user_id");

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'JobRequestForm_replace_for_employee_id_fkey'
  ) THEN
    ALTER TABLE "JobRequestForm" DROP CONSTRAINT "JobRequestForm_replace_for_employee_id_fkey";
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'JobRequestForm_replace_for_user_id_fkey'
  ) THEN
    ALTER TABLE "JobRequestForm"
      ADD CONSTRAINT "JobRequestForm_replace_for_user_id_fkey"
      FOREIGN KEY ("replace_for_user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DROP INDEX IF EXISTS "JobRequestForm_replace_for_employee_id_idx";

ALTER TABLE "JobRequestForm"
  DROP COLUMN IF EXISTS "replace_for",
  DROP COLUMN IF EXISTS "replace_for_employee_id";

-- Candidate enterprise fields.
ALTER TABLE "Candidate"
  ADD COLUMN IF NOT EXISTS "location" TEXT,
  ADD COLUMN IF NOT EXISTS "country" TEXT,
  ADD COLUMN IF NOT EXISTS "city" TEXT,
  ADD COLUMN IF NOT EXISTS "nationality" TEXT,
  ADD COLUMN IF NOT EXISTS "expected_salary" DECIMAL(12,2),
  ADD COLUMN IF NOT EXISTS "current_salary" DECIMAL(12,2),
  ADD COLUMN IF NOT EXISTS "education_level" TEXT,
  ADD COLUMN IF NOT EXISTS "highest_degree" TEXT,
  ADD COLUMN IF NOT EXISTS "last_activity_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "profile_score" DOUBLE PRECISION;

-- Candidate education/experience tables.
CREATE TABLE IF NOT EXISTS "CandidateEducation" (
  "id" UUID NOT NULL,
  "candidate_id" UUID NOT NULL,
  "institution" TEXT NOT NULL,
  "degree" TEXT NOT NULL,
  "field" TEXT NOT NULL,
  "start_date" TIMESTAMP(3),
  "end_date" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CandidateEducation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "CandidateExperience" (
  "id" UUID NOT NULL,
  "candidate_id" UUID NOT NULL,
  "company" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "start_date" TIMESTAMP(3),
  "end_date" TIMESTAMP(3),
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CandidateExperience_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "CandidateEducation_candidate_id_idx" ON "CandidateEducation"("candidate_id");
CREATE INDEX IF NOT EXISTS "CandidateExperience_candidate_id_idx" ON "CandidateExperience"("candidate_id");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'CandidateEducation_candidate_id_fkey'
  ) THEN
    ALTER TABLE "CandidateEducation"
      ADD CONSTRAINT "CandidateEducation_candidate_id_fkey"
      FOREIGN KEY ("candidate_id") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'CandidateExperience_candidate_id_fkey'
  ) THEN
    ALTER TABLE "CandidateExperience"
      ADD CONSTRAINT "CandidateExperience_candidate_id_fkey"
      FOREIGN KEY ("candidate_id") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
