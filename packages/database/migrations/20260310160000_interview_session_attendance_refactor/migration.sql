-- Interview architecture refactor: session + participant + assignment + feedback
-- Includes applicant attendance tracking on InterviewParticipant.

-- Remove legacy trigger/function from old Interview model
DROP TRIGGER IF EXISTS "trg_interview_job_matches_applicant" ON "Interview";
DROP FUNCTION IF EXISTS "fn_interview_job_matches_applicant"();

-- Hard-drop legacy Interview table
DROP TABLE IF EXISTS "Interview" CASCADE;

-- Attendance enum for participant-level attendance lifecycle
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'InterviewAttendanceStatus'
  ) THEN
    CREATE TYPE "InterviewAttendanceStatus" AS ENUM (
      'SCHEDULED',
      'ATTENDING',
      'NO_SHOW',
      'COMPLETED',
      'CANCELLED'
    );
  END IF;
END $$;

CREATE TABLE "InterviewSession" (
  "id" UUID NOT NULL,
  "job_id" UUID NOT NULL,
  "type" VARCHAR(100) NOT NULL DEFAULT 'TECHNICAL',
  "round" INTEGER NOT NULL DEFAULT 1,
  "status" VARCHAR(100) NOT NULL DEFAULT 'SCHEDULED',
  "scheduled_at" TIMESTAMP(3) NOT NULL,
  "duration_minutes" INTEGER,
  "location" VARCHAR(255),
  "meeting_url" TEXT,
  "created_by_id" UUID NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "InterviewSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InterviewParticipant" (
  "id" UUID NOT NULL,
  "session_id" UUID NOT NULL,
  "applicant_id" UUID NOT NULL,
  "attendance_status" "InterviewAttendanceStatus" NOT NULL DEFAULT 'SCHEDULED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InterviewParticipant_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InterviewerAssignment" (
  "id" UUID NOT NULL,
  "session_id" UUID NOT NULL,
  "interviewer_id" UUID NOT NULL,
  "role" VARCHAR(100),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InterviewerAssignment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InterviewFeedback" (
  "id" UUID NOT NULL,
  "session_id" UUID NOT NULL,
  "participant_id" UUID NOT NULL,
  "assignment_id" UUID NOT NULL,
  "score" DOUBLE PRECISION,
  "endorsement" VARCHAR(100),
  "strengths" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "weaknesses" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "notes" TEXT,
  "submitted_at" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "InterviewFeedback_pkey" PRIMARY KEY ("id")
);

-- Uniqueness / integrity keys required by application rules
CREATE UNIQUE INDEX "InterviewParticipant_session_id_applicant_id_key"
  ON "InterviewParticipant"("session_id", "applicant_id");

CREATE UNIQUE INDEX "InterviewParticipant_id_session_id_key"
  ON "InterviewParticipant"("id", "session_id");

CREATE UNIQUE INDEX "InterviewerAssignment_session_id_interviewer_id_key"
  ON "InterviewerAssignment"("session_id", "interviewer_id");

CREATE UNIQUE INDEX "InterviewerAssignment_id_session_id_key"
  ON "InterviewerAssignment"("id", "session_id");

CREATE UNIQUE INDEX "InterviewFeedback_participant_id_assignment_id_key"
  ON "InterviewFeedback"("participant_id", "assignment_id");

-- Operational indexes
CREATE INDEX "InterviewSession_job_id_idx" ON "InterviewSession"("job_id");
CREATE INDEX "InterviewSession_status_idx" ON "InterviewSession"("status");
CREATE INDEX "InterviewSession_scheduled_at_idx" ON "InterviewSession"("scheduled_at");
CREATE INDEX "InterviewSession_job_id_round_idx" ON "InterviewSession"("job_id", "round");
CREATE INDEX "InterviewSession_created_by_id_idx" ON "InterviewSession"("created_by_id");

CREATE INDEX "InterviewParticipant_session_id_idx" ON "InterviewParticipant"("session_id");
CREATE INDEX "InterviewParticipant_applicant_id_idx" ON "InterviewParticipant"("applicant_id");

CREATE INDEX "InterviewerAssignment_session_id_idx" ON "InterviewerAssignment"("session_id");
CREATE INDEX "InterviewerAssignment_interviewer_id_idx" ON "InterviewerAssignment"("interviewer_id");

CREATE INDEX "InterviewFeedback_session_id_idx" ON "InterviewFeedback"("session_id");
CREATE INDEX "InterviewFeedback_participant_id_idx" ON "InterviewFeedback"("participant_id");
CREATE INDEX "InterviewFeedback_assignment_id_idx" ON "InterviewFeedback"("assignment_id");
CREATE INDEX "InterviewFeedback_participant_id_assignment_id_idx"
  ON "InterviewFeedback"("participant_id", "assignment_id");

-- Foreign keys
-- NOTE: "Job" table is introduced in a later migration. The FK is added
-- in a follow-up migration to keep fresh resets ordered and consistent.


ALTER TABLE "InterviewParticipant"
  ADD CONSTRAINT "InterviewParticipant_session_id_fkey"
  FOREIGN KEY ("session_id") REFERENCES "InterviewSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;


ALTER TABLE "InterviewerAssignment"
  ADD CONSTRAINT "InterviewerAssignment_session_id_fkey"
  FOREIGN KEY ("session_id") REFERENCES "InterviewSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- NOTE: "User" and "Applicant" tables are introduced in a later migration.
-- The corresponding FKs are added in a follow-up migration to keep fresh resets ordered.

ALTER TABLE "InterviewFeedback"
  ADD CONSTRAINT "InterviewFeedback_session_id_fkey"
  FOREIGN KEY ("session_id") REFERENCES "InterviewSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "InterviewFeedback"
  ADD CONSTRAINT "InterviewFeedback_participant_id_session_id_fkey"
  FOREIGN KEY ("participant_id", "session_id")
  REFERENCES "InterviewParticipant"("id", "session_id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "InterviewFeedback"
  ADD CONSTRAINT "InterviewFeedback_assignment_id_session_id_fkey"
  FOREIGN KEY ("assignment_id", "session_id")
  REFERENCES "InterviewerAssignment"("id", "session_id")
  ON DELETE CASCADE ON UPDATE CASCADE;
