-- Enforce required department/position on jobs and align FK delete behavior.
ALTER TABLE "Job" ALTER COLUMN "department_id" SET NOT NULL;
ALTER TABLE "Job" ALTER COLUMN "position_id" SET NOT NULL;

ALTER TABLE "Job" DROP CONSTRAINT "Job_department_id_fkey";
ALTER TABLE "Job" ADD CONSTRAINT "Job_department_id_fkey"
  FOREIGN KEY ("department_id") REFERENCES "Department"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Job" DROP CONSTRAINT "Job_position_id_fkey";
ALTER TABLE "Job" ADD CONSTRAINT "Job_position_id_fkey"
  FOREIGN KEY ("position_id") REFERENCES "Position"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
