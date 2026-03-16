-- Remove redundant InterviewFeedback.session_id and normalize feedback draft semantics.
-- Also remove duplicated ApplicantStatusHistory.createdAt event timestamp.

DO $$
BEGIN
  IF to_regclass('public."ApplicantStatusHistory"') IS NOT NULL THEN
    ALTER TABLE "ApplicantStatusHistory"
      DROP COLUMN IF EXISTS "createdAt";
  END IF;
END $$;

ALTER TABLE "InterviewFeedback"
  DROP CONSTRAINT IF EXISTS "InterviewFeedback_session_id_fkey";

ALTER TABLE "InterviewFeedback"
  DROP CONSTRAINT IF EXISTS "InterviewFeedback_participant_id_session_id_fkey";

ALTER TABLE "InterviewFeedback"
  DROP CONSTRAINT IF EXISTS "InterviewFeedback_assignment_id_session_id_fkey";

DROP INDEX IF EXISTS "InterviewFeedback_session_id_idx";

ALTER TABLE "InterviewFeedback"
  DROP COLUMN IF EXISTS "session_id";

ALTER TABLE "InterviewFeedback"
  ADD COLUMN IF NOT EXISTS "is_draft" BOOLEAN NOT NULL DEFAULT TRUE;

UPDATE "InterviewFeedback"
SET "is_draft" = CASE WHEN "submitted_at" IS NULL THEN TRUE ELSE FALSE END;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'InterviewFeedback_participant_id_fkey'
  ) THEN
    ALTER TABLE "InterviewFeedback"
      ADD CONSTRAINT "InterviewFeedback_participant_id_fkey"
      FOREIGN KEY ("participant_id")
      REFERENCES "InterviewParticipant"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'InterviewFeedback_assignment_id_fkey'
  ) THEN
    ALTER TABLE "InterviewFeedback"
      ADD CONSTRAINT "InterviewFeedback_assignment_id_fkey"
      FOREIGN KEY ("assignment_id")
      REFERENCES "InterviewerAssignment"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION "fn_interview_feedback_assignment_matches_participant_session"()
RETURNS TRIGGER AS $$
DECLARE
  participant_session_id UUID;
  assignment_session_id UUID;
BEGIN
  SELECT "session_id"
  INTO participant_session_id
  FROM "InterviewParticipant"
  WHERE "id" = NEW."participant_id";

  SELECT "session_id"
  INTO assignment_session_id
  FROM "InterviewerAssignment"
  WHERE "id" = NEW."assignment_id";

  IF participant_session_id IS NULL THEN
    RAISE EXCEPTION 'Interview participant % does not exist', NEW."participant_id";
  END IF;

  IF assignment_session_id IS NULL THEN
    RAISE EXCEPTION 'Interviewer assignment % does not exist', NEW."assignment_id";
  END IF;

  IF participant_session_id <> assignment_session_id THEN
    RAISE EXCEPTION 'Interview feedback participant and assignment must belong to the same session';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS "trg_interview_feedback_assignment_matches_participant_session" ON "InterviewFeedback";

CREATE TRIGGER "trg_interview_feedback_assignment_matches_participant_session"
BEFORE INSERT OR UPDATE OF "participant_id", "assignment_id" ON "InterviewFeedback"
FOR EACH ROW
EXECUTE FUNCTION "fn_interview_feedback_assignment_matches_participant_session"();
