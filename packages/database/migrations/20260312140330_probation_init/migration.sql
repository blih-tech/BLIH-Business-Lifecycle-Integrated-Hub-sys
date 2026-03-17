/*
  Warnings:

  - You are about to drop the column `city` on the `Applicant` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `Applicant` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `ApplicantStatusHistory` table. All the data in the column will be lost.
  - The `endorsement` column on the `InterviewFeedback` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `InterviewSession` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `employment_type` on the `Offer` table. All the data in the column will be lost.
  - You are about to drop the `HiringDecision` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Interview` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `type` on the `InterviewSession` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterEnum
ALTER TYPE "ApplicantStatus" ADD VALUE 'WAITLIST';

-- DropForeignKey
ALTER TABLE "HiringDecision" DROP CONSTRAINT "HiringDecision_applicant_id_fkey";

-- DropForeignKey
ALTER TABLE "HiringDecision" DROP CONSTRAINT "HiringDecision_job_id_fkey";

-- DropForeignKey
ALTER TABLE "HiringDecision" DROP CONSTRAINT "HiringDecision_submitted_by_id_fkey";

-- DropForeignKey
ALTER TABLE "Interview" DROP CONSTRAINT "Interview_applicant_id_fkey";

-- DropForeignKey
ALTER TABLE "Interview" DROP CONSTRAINT "Interview_interviewer_id_fkey";

-- DropForeignKey
ALTER TABLE "Interview" DROP CONSTRAINT "Interview_job_id_fkey";

-- AlterTable
ALTER TABLE "Applicant" DROP COLUMN "city",
DROP COLUMN "country",
ADD COLUMN     "waitlist_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ApplicantStatusHistory" DROP COLUMN "createdAt";

-- AlterTable
ALTER TABLE "InterviewFeedback" DROP COLUMN "endorsement",
ADD COLUMN     "endorsement" "EndorsementLevel";

-- AlterTable
ALTER TABLE "InterviewSession" DROP COLUMN "type",
ADD COLUMN     "type" "InterviewType" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "InterviewStatus" NOT NULL DEFAULT 'SCHEDULED';

-- AlterTable
ALTER TABLE "Offer" DROP COLUMN "employment_type",
ADD COLUMN     "employmentType" "EmploymentType";

-- DropTable
DROP TABLE "HiringDecision";

-- DropTable
DROP TABLE "Interview";

-- DropEnum
DROP TYPE "HiringDecisionOutcome";

-- CreateIndex
CREATE INDEX "InterviewSession_status_idx" ON "InterviewSession"("status");

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_applicant_id_fkey" FOREIGN KEY ("applicant_id") REFERENCES "Applicant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
