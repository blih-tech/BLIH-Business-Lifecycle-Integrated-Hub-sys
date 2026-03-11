-- Recruitment refactor:
-- - Applicant full_name split into first_name/last_name
-- - ApplicantStatus extended with SCREENING and WITHDRAWN
-- - JobApplicationFormField restricted to optional-only keys
-- - JobApplicationFormSection configuration table added
-- - Legacy JobApplicationStatus enum removed when no dependencies remain

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'JobApplicantOptionalFieldKey'
  ) THEN
    CREATE TYPE "JobApplicantOptionalFieldKey" AS ENUM (
      'PHONE',
      'LINKEDIN_URL',
      'PORTFOLIO_URL',
      'GITHUB_URL',
      'EXPECTED_SALARY',
      'COVER_LETTER'
    );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'JobApplicationFormSectionKey'
  ) THEN
    CREATE TYPE "JobApplicationFormSectionKey" AS ENUM (
      'EDUCATION',
      'EXPERIENCE'
    );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_attribute
    WHERE attrelid = '"Applicant"'::regclass
      AND attname = 'first_name'
      AND NOT attisdropped
  ) THEN
    ALTER TABLE "Applicant" ADD COLUMN "first_name" TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_attribute
    WHERE attrelid = '"Applicant"'::regclass
      AND attname = 'last_name'
      AND NOT attisdropped
  ) THEN
    ALTER TABLE "Applicant" ADD COLUMN "last_name" TEXT;
  END IF;
END
$$;

UPDATE "Applicant"
SET
  "first_name" = CASE
    WHEN btrim(COALESCE("full_name", '')) = '' THEN 'Unknown'
    ELSE split_part(btrim("full_name"), ' ', 1)
  END,
  "last_name" = CASE
    WHEN btrim(COALESCE("full_name", '')) = '' THEN 'Unknown'
    ELSE COALESCE(
      NULLIF(
        btrim(regexp_replace(btrim("full_name"), '^\S+\s*', '')),
        ''
      ),
      'Unknown'
    )
  END
WHERE "first_name" IS NULL OR "last_name" IS NULL;

ALTER TABLE "Applicant"
  ALTER COLUMN "first_name" SET NOT NULL,
  ALTER COLUMN "last_name" SET NOT NULL;

ALTER TABLE "Applicant" DROP COLUMN IF EXISTS "full_name";

ALTER TABLE "Applicant"
  ADD COLUMN IF NOT EXISTS "screening_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "withdrawn_at" TIMESTAMP(3);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum
    WHERE enumlabel = 'SCREENING'
      AND enumtypid = '"ApplicantStatus"'::regtype
  ) THEN
    ALTER TYPE "ApplicantStatus" ADD VALUE 'SCREENING' AFTER 'APPLIED';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum
    WHERE enumlabel = 'WITHDRAWN'
      AND enumtypid = '"ApplicantStatus"'::regtype
  ) THEN
    ALTER TYPE "ApplicantStatus" ADD VALUE 'WITHDRAWN' AFTER 'REJECTED';
  END IF;
END
$$;

DELETE FROM "JobApplicationFormField"
WHERE "key"::text NOT IN (
  'PHONE',
  'LINKEDIN_URL',
  'PORTFOLIO_URL',
  'GITHUB_URL',
  'EXPECTED_SALARY',
  'COVER_LETTER'
);

ALTER TABLE "JobApplicationFormField"
  ALTER COLUMN "key" TYPE "JobApplicantOptionalFieldKey"
  USING "key"::text::"JobApplicantOptionalFieldKey";

CREATE TABLE IF NOT EXISTS "JobApplicationFormSection" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "job_application_form_id" UUID NOT NULL,
  "key" "JobApplicationFormSectionKey" NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT false,
  "required" BOOLEAN NOT NULL DEFAULT false,
  "order" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "JobApplicationFormSection_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "JobApplicationFormSection_job_application_form_id_key_key"
  ON "JobApplicationFormSection"("job_application_form_id", "key");
CREATE INDEX IF NOT EXISTS "JobApplicationFormSection_job_application_form_id_idx"
  ON "JobApplicationFormSection"("job_application_form_id");
CREATE INDEX IF NOT EXISTS "JobApplicationFormSection_job_application_form_id_order_idx"
  ON "JobApplicationFormSection"("job_application_form_id", "order");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'JobApplicationFormSection_job_application_form_id_fkey'
  ) THEN
    ALTER TABLE "JobApplicationFormSection"
      ADD CONSTRAINT "JobApplicationFormSection_job_application_form_id_fkey"
      FOREIGN KEY ("job_application_form_id") REFERENCES "JobApplicationForm"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;

INSERT INTO "JobApplicationFormSection" (
  "job_application_form_id",
  "key",
  "enabled",
  "required",
  "order",
  "updatedAt"
)
SELECT
  jaf."id",
  cfg."key"::"JobApplicationFormSectionKey",
  cfg."enabled",
  cfg."required",
  cfg."order",
  NOW()
FROM "JobApplicationForm" jaf
CROSS JOIN (
  VALUES
    ('EDUCATION', false, false, 1),
    ('EXPERIENCE', false, false, 2)
) AS cfg("key", "enabled", "required", "order")
ON CONFLICT ("job_application_form_id", "key") DO NOTHING;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'JobApplicationStatus'
  ) AND NOT EXISTS (
    SELECT 1
    FROM pg_attribute a
    JOIN pg_type t ON a.atttypid = t.oid
    WHERE t.typname = 'JobApplicationStatus'
      AND a.attnum > 0
      AND NOT a.attisdropped
  ) THEN
    DROP TYPE "JobApplicationStatus";
  END IF;
END
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'JobApplicantFieldKey'
  ) AND NOT EXISTS (
    SELECT 1
    FROM pg_attribute a
    JOIN pg_type t ON a.atttypid = t.oid
    WHERE t.typname = 'JobApplicantFieldKey'
      AND a.attnum > 0
      AND NOT a.attisdropped
  ) THEN
    DROP TYPE "JobApplicantFieldKey";
  END IF;
END
$$;