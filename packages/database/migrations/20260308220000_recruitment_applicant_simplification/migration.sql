-- Recruitment simplification: Applicant-only model and array-based job skills/responsibilities

-- 1) Archive legacy recruitment tables (no backfill migration strategy)
DO $$
BEGIN
  IF to_regclass('"Candidate"') IS NOT NULL AND to_regclass('"Candidate_legacy"') IS NULL THEN
    EXECUTE 'CREATE TABLE "Candidate_legacy" AS TABLE "Candidate"';
  END IF;
  IF to_regclass('"JobApplication"') IS NOT NULL AND to_regclass('"JobApplication_legacy"') IS NULL THEN
    EXECUTE 'CREATE TABLE "JobApplication_legacy" AS TABLE "JobApplication"';
  END IF;
  IF to_regclass('"CandidateSkill"') IS NOT NULL AND to_regclass('"CandidateSkill_legacy"') IS NULL THEN
    EXECUTE 'CREATE TABLE "CandidateSkill_legacy" AS TABLE "CandidateSkill"';
  END IF;
  IF to_regclass('"CandidateEducation"') IS NOT NULL AND to_regclass('"CandidateEducation_legacy"') IS NULL THEN
    EXECUTE 'CREATE TABLE "CandidateEducation_legacy" AS TABLE "CandidateEducation"';
  END IF;
  IF to_regclass('"CandidateExperience"') IS NOT NULL AND to_regclass('"CandidateExperience_legacy"') IS NULL THEN
    EXECUTE 'CREATE TABLE "CandidateExperience_legacy" AS TABLE "CandidateExperience"';
  END IF;
  IF to_regclass('"Interview"') IS NOT NULL AND to_regclass('"Interview_legacy"') IS NULL THEN
    EXECUTE 'CREATE TABLE "Interview_legacy" AS TABLE "Interview"';
  END IF;
  IF to_regclass('"HiringDecision"') IS NOT NULL AND to_regclass('"HiringDecision_legacy"') IS NULL THEN
    EXECUTE 'CREATE TABLE "HiringDecision_legacy" AS TABLE "HiringDecision"';
  END IF;
END $$;

-- 2) Add new enum for simplified applicant flow
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'ApplicantStatus'
  ) THEN
    CREATE TYPE "ApplicantStatus" AS ENUM ('APPLIED', 'SHORTLISTED', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED');
  END IF;
END $$;

-- 3) Add array fields on Job
ALTER TABLE "Job"
  ADD COLUMN IF NOT EXISTS "skills" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "responsibilities" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- 4) Add array fields on JobDetailsForm
ALTER TABLE "JobDetailsForm"
  ADD COLUMN IF NOT EXISTS "skills" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "responsibilities" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- 5) Applicant core table
CREATE TABLE IF NOT EXISTS "Applicant" (
  "id" UUID NOT NULL,
  "job_id" UUID NOT NULL,
  "application_form_id" UUID,
  "full_name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "resume_url" TEXT,
  "linkedin_url" TEXT,
  "portfolio_url" TEXT,
  "github_url" TEXT,
  "source" "CandidateSource" NOT NULL DEFAULT 'COMPANY_SITE',
  "referred_by_id" UUID,
  "current_company" TEXT,
  "current_position" TEXT,
  "years_experience" INTEGER,
  "location" TEXT,
  "country" TEXT,
  "city" TEXT,
  "nationality" TEXT,
  "expected_salary" DECIMAL(12,2),
  "current_salary" DECIMAL(12,2),
  "education_level" TEXT,
  "highest_degree" TEXT,
  "skills" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "status" "ApplicantStatus" NOT NULL DEFAULT 'APPLIED',
  "cover_letter" TEXT,
  "source_snapshot" JSONB,
  "custom_field_values" JSONB,
  "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "shortlisted_at" TIMESTAMP(3),
  "interview_at" TIMESTAMP(3),
  "offer_at" TIMESTAMP(3),
  "hired_at" TIMESTAMP(3),
  "rejected_at" TIMESTAMP(3),
  "last_activity_at" TIMESTAMP(3),
  "profile_score" DOUBLE PRECISION,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Applicant_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Applicant_job_id_email_key" ON "Applicant"("job_id", "email");
CREATE INDEX IF NOT EXISTS "Applicant_job_id_idx" ON "Applicant"("job_id");
CREATE INDEX IF NOT EXISTS "Applicant_status_idx" ON "Applicant"("status");
CREATE INDEX IF NOT EXISTS "Applicant_email_idx" ON "Applicant"("email");
CREATE INDEX IF NOT EXISTS "Applicant_referred_by_id_idx" ON "Applicant"("referred_by_id");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Applicant_job_id_fkey') THEN
    ALTER TABLE "Applicant"
      ADD CONSTRAINT "Applicant_job_id_fkey"
      FOREIGN KEY ("job_id") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Applicant_application_form_id_fkey') THEN
    ALTER TABLE "Applicant"
      ADD CONSTRAINT "Applicant_application_form_id_fkey"
      FOREIGN KEY ("application_form_id") REFERENCES "JobApplicationForm"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Applicant_referred_by_id_fkey') THEN
    ALTER TABLE "Applicant"
      ADD CONSTRAINT "Applicant_referred_by_id_fkey"
      FOREIGN KEY ("referred_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- 6) Applicant education/experience child tables
CREATE TABLE IF NOT EXISTS "ApplicantEducation" (
  "id" UUID NOT NULL,
  "applicant_id" UUID NOT NULL,
  "institution" TEXT NOT NULL,
  "degree" TEXT NOT NULL,
  "field" TEXT NOT NULL,
  "start_date" TIMESTAMP(3),
  "end_date" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ApplicantEducation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ApplicantExperience" (
  "id" UUID NOT NULL,
  "applicant_id" UUID NOT NULL,
  "company" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "start_date" TIMESTAMP(3),
  "end_date" TIMESTAMP(3),
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ApplicantExperience_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ApplicantEducation_applicant_id_idx" ON "ApplicantEducation"("applicant_id");
CREATE INDEX IF NOT EXISTS "ApplicantExperience_applicant_id_idx" ON "ApplicantExperience"("applicant_id");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ApplicantEducation_applicant_id_fkey') THEN
    ALTER TABLE "ApplicantEducation"
      ADD CONSTRAINT "ApplicantEducation_applicant_id_fkey"
      FOREIGN KEY ("applicant_id") REFERENCES "Applicant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ApplicantExperience_applicant_id_fkey') THEN
    ALTER TABLE "ApplicantExperience"
      ADD CONSTRAINT "ApplicantExperience_applicant_id_fkey"
      FOREIGN KEY ("applicant_id") REFERENCES "Applicant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- 7) Add new applicant references to Interview/HiringDecision
ALTER TABLE "Interview" ADD COLUMN IF NOT EXISTS "applicant_id" UUID;
ALTER TABLE "HiringDecision" ADD COLUMN IF NOT EXISTS "applicant_id" UUID;

-- no-backfill strategy: preserve in _legacy tables, clear current dependent records before enforcing required applicant relation
DELETE FROM "Interview";
DELETE FROM "HiringDecision";

CREATE INDEX IF NOT EXISTS "Interview_applicant_id_idx" ON "Interview"("applicant_id");
CREATE INDEX IF NOT EXISTS "HiringDecision_applicant_id_idx" ON "HiringDecision"("applicant_id");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Interview_applicant_id_fkey') THEN
    ALTER TABLE "Interview"
      ADD CONSTRAINT "Interview_applicant_id_fkey"
      FOREIGN KEY ("applicant_id") REFERENCES "Applicant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'HiringDecision_applicant_id_fkey') THEN
    ALTER TABLE "HiringDecision"
      ADD CONSTRAINT "HiringDecision_applicant_id_fkey"
      FOREIGN KEY ("applicant_id") REFERENCES "Applicant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

ALTER TABLE "Interview" ALTER COLUMN "applicant_id" SET NOT NULL;
ALTER TABLE "HiringDecision" ALTER COLUMN "applicant_id" SET NOT NULL;

-- 8) Drop legacy candidate/application foreign keys and columns after applicant columns are enforced
ALTER TABLE "Interview" DROP COLUMN IF EXISTS "candidate_id";
ALTER TABLE "HiringDecision" DROP COLUMN IF EXISTS "candidate_id";

-- 9) Drop legacy recruitment tables
DROP TABLE IF EXISTS "CandidateSkill" CASCADE;
DROP TABLE IF EXISTS "CandidateEducation" CASCADE;
DROP TABLE IF EXISTS "CandidateExperience" CASCADE;
DROP TABLE IF EXISTS "JobApplication" CASCADE;
DROP TABLE IF EXISTS "Candidate" CASCADE;
DROP TABLE IF EXISTS "JobSkill" CASCADE;
DROP TABLE IF EXISTS "JobResponsibility" CASCADE;

-- 10) Drop legacy helper columns no longer used
ALTER TABLE "JobDetailsForm" DROP COLUMN IF EXISTS "key_responsibilities";
