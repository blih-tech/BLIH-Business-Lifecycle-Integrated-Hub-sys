-- Add InterviewSession.job_id foreign key after Job table exists.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'InterviewSession_job_id_fkey'
  ) THEN
    ALTER TABLE "InterviewSession"
      ADD CONSTRAINT "InterviewSession_job_id_fkey"
      FOREIGN KEY ("job_id") REFERENCES "Job"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Add InterviewSession.created_by_id foreign key after User table exists.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'InterviewSession_created_by_id_fkey'
  ) THEN
    ALTER TABLE "InterviewSession"
      ADD CONSTRAINT "InterviewSession_created_by_id_fkey"
      FOREIGN KEY ("created_by_id") REFERENCES "User"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- Add InterviewParticipant.applicant_id foreign key after Applicant table exists.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'InterviewParticipant_applicant_id_fkey'
  ) THEN
    ALTER TABLE "InterviewParticipant"
      ADD CONSTRAINT "InterviewParticipant_applicant_id_fkey"
      FOREIGN KEY ("applicant_id") REFERENCES "Applicant"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Add InterviewerAssignment.interviewer_id foreign key after User table exists.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'InterviewerAssignment_interviewer_id_fkey'
  ) THEN
    ALTER TABLE "InterviewerAssignment"
      ADD CONSTRAINT "InterviewerAssignment_interviewer_id_fkey"
      FOREIGN KEY ("interviewer_id") REFERENCES "User"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;
