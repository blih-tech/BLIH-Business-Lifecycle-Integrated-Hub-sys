-- Interview question bank and structured question responses on interview feedback.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'InterviewQuestionCategory'
  ) THEN
    CREATE TYPE "InterviewQuestionCategory" AS ENUM (
      'TECHNICAL',
      'BEHAVIORAL',
      'SITUATIONAL',
      'PROBLEM_SOLVING',
      'LEADERSHIP',
      'COMMUNICATION',
      'DOMAIN_KNOWLEDGE',
      'CULTURAL_FIT',
      'GENERAL'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'InterviewQuestionType'
  ) THEN
    CREATE TYPE "InterviewQuestionType" AS ENUM (
      'TEXT',
      'TEXTAREA',
      'BOOLEAN',
      'RATING',
      'SINGLE_SELECT',
      'MULTI_SELECT'
    );
  END IF;
END $$;

ALTER TABLE "InterviewFeedback"
  ADD COLUMN IF NOT EXISTS "question_responses" JSONB;

CREATE TABLE IF NOT EXISTS "InterviewQuestion" (
  "id" UUID NOT NULL,
  "question" TEXT NOT NULL,
  "description" TEXT,
  "category" "InterviewQuestionCategory",
  "type" "InterviewQuestionType" NOT NULL,
  "options" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "difficulty" INTEGER,
  "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "created_by_id" UUID NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "InterviewQuestion_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "InterviewQuestion_created_by_id_idx"
  ON "InterviewQuestion"("created_by_id");

CREATE INDEX IF NOT EXISTS "InterviewQuestion_category_idx"
  ON "InterviewQuestion"("category");

CREATE INDEX IF NOT EXISTS "InterviewQuestion_type_idx"
  ON "InterviewQuestion"("type");

CREATE INDEX IF NOT EXISTS "InterviewQuestion_is_active_idx"
  ON "InterviewQuestion"("is_active");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'InterviewQuestion_created_by_id_fkey'
  ) THEN
    ALTER TABLE "InterviewQuestion"
      ADD CONSTRAINT "InterviewQuestion_created_by_id_fkey"
      FOREIGN KEY ("created_by_id")
      REFERENCES "User"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;
