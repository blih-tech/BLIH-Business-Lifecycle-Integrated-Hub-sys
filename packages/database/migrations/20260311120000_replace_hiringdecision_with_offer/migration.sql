-- Replace HiringDecision with Offer model
-- Adds OfferStatus enum + Offer table, adds WAITLIST to ApplicantStatus,
-- migrates existing HiringDecision rows into Offer, rewires onboarding checklist links,
-- then drops HiringDecision and its enum type.

-- 1) OfferStatus enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'OfferStatus') THEN
    CREATE TYPE "OfferStatus" AS ENUM (
      'DRAFT',
      'SENT',
      'ACCEPTED',
      'DECLINED',
      'EXPIRED',
      'WITHDRAWN'
    );
  END IF;
END $$;

-- 2) ApplicantStatus add WAITLIST (safe no-op if already present)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ApplicantStatus') THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_enum e
      JOIN pg_type t ON t.oid = e.enumtypid
      WHERE t.typname = 'ApplicantStatus' AND e.enumlabel = 'WAITLIST'
    ) THEN
      ALTER TYPE "ApplicantStatus" ADD VALUE 'WAITLIST' AFTER 'INTERVIEW';
    END IF;
  END IF;
END $$;

-- 3) Applicant waitlist timestamp
ALTER TABLE "Applicant"
  ADD COLUMN IF NOT EXISTS "waitlist_at" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "Applicant_waitlist_at_idx" ON "Applicant"("waitlist_at");

-- 4) Create Offer table
CREATE TABLE IF NOT EXISTS "Offer" (
  "id" UUID NOT NULL,
  "job_id" UUID NOT NULL,
  "applicant_id" UUID NOT NULL,
  "created_by_id" UUID NOT NULL,
  "status" "OfferStatus" NOT NULL DEFAULT 'DRAFT',
  "salary" DECIMAL(12,2),
  "currency" VARCHAR(8),
  "start_date" DATE,
  "payFrequency" "PayFrequency",
  "employment_type" "EmploymentType",
  "bonus" DECIMAL(12,2),
  "equity" DECIMAL(12,2),
  "offer_letter_url" TEXT,
  "notes" TEXT,
  "sent_at" TIMESTAMP(3),
  "responded_at" TIMESTAMP(3),
  "expires_at" TIMESTAMP(3),
  "onboarding_id" UUID,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- unique and indexes
CREATE UNIQUE INDEX IF NOT EXISTS "Offer_job_id_applicant_id_key" ON "Offer"("job_id", "applicant_id");
CREATE UNIQUE INDEX IF NOT EXISTS "Offer_onboarding_id_key" ON "Offer"("onboarding_id");
CREATE INDEX IF NOT EXISTS "Offer_job_id_idx" ON "Offer"("job_id");
CREATE INDEX IF NOT EXISTS "Offer_applicant_id_idx" ON "Offer"("applicant_id");
CREATE INDEX IF NOT EXISTS "Offer_status_idx" ON "Offer"("status");
CREATE INDEX IF NOT EXISTS "Offer_created_by_id_idx" ON "Offer"("created_by_id");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Offer_job_id_fkey') THEN
    ALTER TABLE "Offer"
      ADD CONSTRAINT "Offer_job_id_fkey"
      FOREIGN KEY ("job_id") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Offer_applicant_id_fkey') THEN
    ALTER TABLE "Offer"
      ADD CONSTRAINT "Offer_applicant_id_fkey"
      FOREIGN KEY ("applicant_id") REFERENCES "Applicant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Offer_created_by_id_fkey') THEN
    ALTER TABLE "Offer"
      ADD CONSTRAINT "Offer_created_by_id_fkey"
      FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Offer_onboarding_id_fkey') THEN
    ALTER TABLE "Offer"
      ADD CONSTRAINT "Offer_onboarding_id_fkey"
      FOREIGN KEY ("onboarding_id") REFERENCES "Onboarding"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- 5) Rewire onboarding checklist: hiring_decision_id -> offer_id (best-effort)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'OnboardingChecklist' AND column_name = 'hiring_decision_id'
  ) THEN
    ALTER TABLE "OnboardingChecklist" RENAME COLUMN "hiring_decision_id" TO "offer_id";
  END IF;
END $$;

-- Drop old FK if present (ignore if missing)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'OnboardingChecklist_hiring_decision_id_fkey') THEN
    ALTER TABLE "OnboardingChecklist" DROP CONSTRAINT "OnboardingChecklist_hiring_decision_id_fkey";
  END IF;
END $$;

-- Create index + FK to Offer (ignore if already there)
CREATE INDEX IF NOT EXISTS "OnboardingChecklist_offer_id_idx" ON "OnboardingChecklist"("offer_id");

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'OnboardingChecklist' AND column_name = 'offer_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'OnboardingChecklist_offer_id_fkey'
  ) THEN
    ALTER TABLE "OnboardingChecklist"
      ADD CONSTRAINT "OnboardingChecklist_offer_id_fkey"
      FOREIGN KEY ("offer_id") REFERENCES "Offer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- 6) Backfill offers from HiringDecision if present
DO $$
BEGIN
  IF to_regclass('"HiringDecision"') IS NOT NULL THEN
    EXECUTE $SQL$
      INSERT INTO "Offer" (
        "id",
        "job_id",
        "applicant_id",
        "created_by_id",
        "status",
        "salary",
        "currency",
        "start_date",
        "notes",
        "sent_at",
        "responded_at",
        "onboarding_id",
        "createdAt",
        "updatedAt"
      )
      SELECT
        hd."id",
        hd."job_id",
        hd."applicant_id",
        hd."submitted_by_id",
        CASE
          WHEN hd."outcome" = 'OFFER_DECLINED' THEN 'DECLINED'::"OfferStatus"
          WHEN hd."outcome" = 'SUSPENDED' THEN 'WITHDRAWN'::"OfferStatus"
          ELSE 'SENT'::"OfferStatus"
        END AS "status",
        hd."salary_offered",
        hd."currency",
        hd."start_date",
        hd."decision_notes",
        hd."decided_at",
        CASE WHEN hd."outcome" = 'OFFER_DECLINED' THEN hd."decided_at" ELSE NULL END,
        hd."onboarding_id",
        hd."createdAt",
        hd."updatedAt"
      FROM "HiringDecision" hd
      ON CONFLICT ("job_id","applicant_id") DO NOTHING
    $SQL$;
  END IF;
END $$;

-- 7) Drop HiringDecision table (and any dependent FKs)
DROP TABLE IF EXISTS "HiringDecision" CASCADE;

-- 8) Drop legacy enum type if nothing depends on it
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'HiringDecisionOutcome') THEN
    DROP TYPE "HiringDecisionOutcome";
  END IF;
END $$;

