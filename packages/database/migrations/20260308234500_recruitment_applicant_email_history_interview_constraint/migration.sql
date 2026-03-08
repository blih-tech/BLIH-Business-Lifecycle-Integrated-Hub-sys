-- Recruitment hardening:
-- 1) Case-insensitive applicant email uniqueness per job
-- 2) Applicant status history audit table
-- 3) Interview job/applicant consistency via composite foreign key

-- 1) Applicant email normalization for case-insensitive uniqueness
ALTER TABLE "Applicant"
  ADD COLUMN IF NOT EXISTS "email_normalized" TEXT;

UPDATE "Applicant"
SET "email_normalized" = lower(trim("email"))
WHERE "email_normalized" IS NULL;

ALTER TABLE "Applicant"
  ALTER COLUMN "email_normalized" SET NOT NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "Applicant"
    GROUP BY "job_id", "email_normalized"
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Cannot enforce case-insensitive applicant email uniqueness: duplicate normalized emails exist per job';
  END IF;
END $$;

DROP INDEX IF EXISTS "Applicant_job_id_email_key";
CREATE UNIQUE INDEX IF NOT EXISTS "Applicant_job_id_email_normalized_key"
  ON "Applicant"("job_id", "email_normalized");
CREATE INDEX IF NOT EXISTS "Applicant_email_normalized_idx"
  ON "Applicant"("email_normalized");

-- needed for Interview composite FK (applicant_id, job_id)
CREATE UNIQUE INDEX IF NOT EXISTS "Applicant_id_job_id_key"
  ON "Applicant"("id", "job_id");

-- 2) Applicant status history
CREATE TABLE IF NOT EXISTS "ApplicantStatusHistory" (
  "id" UUID NOT NULL,
  "applicant_id" UUID NOT NULL,
  "from_status" "ApplicantStatus",
  "to_status" "ApplicantStatus" NOT NULL,
  "notes" TEXT,
  "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ApplicantStatusHistory_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ApplicantStatusHistory_applicant_id_idx"
  ON "ApplicantStatusHistory"("applicant_id");
CREATE INDEX IF NOT EXISTS "ApplicantStatusHistory_applicant_id_changed_at_idx"
  ON "ApplicantStatusHistory"("applicant_id", "changed_at");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ApplicantStatusHistory_applicant_id_fkey'
  ) THEN
    ALTER TABLE "ApplicantStatusHistory"
      ADD CONSTRAINT "ApplicantStatusHistory_applicant_id_fkey"
      FOREIGN KEY ("applicant_id") REFERENCES "Applicant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- 3) Interview consistency: ensure interview.job_id always matches applicant.job_id
UPDATE "Interview" i
SET "job_id" = a."job_id"
FROM "Applicant" a
WHERE i."applicant_id" = a."id"
  AND i."job_id" <> a."job_id";

ALTER TABLE "Interview" DROP CONSTRAINT IF EXISTS "Interview_applicant_id_fkey";

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Interview_applicant_id_job_id_fkey'
  ) THEN
    ALTER TABLE "Interview"
      ADD CONSTRAINT "Interview_applicant_id_job_id_fkey"
      FOREIGN KEY ("applicant_id", "job_id") REFERENCES "Applicant"("id", "job_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "Interview_applicant_id_job_id_idx"
  ON "Interview"("applicant_id", "job_id");
