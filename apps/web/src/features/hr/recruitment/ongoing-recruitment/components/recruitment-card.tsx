'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

import { InterviewReviewDialog } from '@/features/hr/recruitment/ongoing-recruitment/components/interview-review-dialog';
import { SetupCommitteeDialog } from '@/features/hr/recruitment/ongoing-recruitment/components/setup-committee-dialog';
import { InterviewTab } from '@/features/hr/recruitment/ongoing-recruitment/components/interview-tab';
import { ShortlistedTab } from '@/features/hr/recruitment/ongoing-recruitment/components/shortlisted-tab';
import { TopTriggers } from '@/features/hr/recruitment/ongoing-recruitment/components/top-triggers';
import { WaitlistedTab } from '@/features/hr/recruitment/ongoing-recruitment/components/waitlisted-tab';
import { ongoingCommitteePeople } from '@/features/hr/recruitment/ongoing-recruitment/mock-data';
import type { OngoingCommitteePerson } from '@/features/hr/recruitment/ongoing-recruitment/types';
import type {
  OngoingInterviewApplicant,
  OngoingRecruitmentJob,
} from '@/features/hr/recruitment/ongoing-recruitment/types';
import { Button } from '@/shared/components/ui/button';
import { Tabs, TabsContent } from '@/shared/components/ui/tabs';

type RecruitmentCardProps = {
  job: OngoingRecruitmentJob;
  currentUserName: string;
  defaultExpanded?: boolean;
};

function namesEqual(left: string, right: string) {
  return left.trim().toLowerCase() === right.trim().toLowerCase();
}

export function RecruitmentCard({
  job,
  currentUserName,
  defaultExpanded = false,
}: RecruitmentCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isCommitteeDialogOpen, setIsCommitteeDialogOpen] = useState(false);
  const [committeeMembers, setCommitteeMembers] = useState<
    OngoingCommitteePerson[]
  >(job.interviewCommittee);
  const [interviews, setInterviews] = useState(job.interviews);
  const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(
    null,
  );

  function handleSaveCommittee(members: OngoingCommitteePerson[]) {
    setCommitteeMembers(members);
    console.log('interviewCommittee', {
      jobId: job.id,
      committeeMemberIds: members.map((member) => member.id),
    });
  }

  const selectedApplicant =
    interviews.find((item) => item.id === selectedApplicantId) ?? null;

  function handleInterviewDecision(payload: {
    applicantId: string;
    action: 'reject' | 'offer' | 'waitlist';
    reviews: OngoingInterviewApplicant['committeeReviews'];
  }) {
    setInterviews((current) =>
      current.map((item) =>
        item.id === payload.applicantId
          ? { ...item, committeeReviews: payload.reviews }
          : item,
      ),
    );

    console.log('interviewDecision', {
      jobId: job.id,
      applicantId: payload.applicantId,
      action: payload.action,
      currentUserName,
      currentUserReview:
        payload.reviews.find((review) =>
          namesEqual(review.memberName, currentUserName),
        ) ?? null,
      reviews: payload.reviews,
    });
  }

  return (
    <>
      <article className="overflow-hidden rounded-[12px] border border-[#e5e5e5] bg-white">
        <div className="space-y-4 px-6 py-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-[18px] font-medium leading-4 tracking-[-0.3125px] text-black">
                  {job.title}
                </h2>
                <span className="inline-flex h-[22px] items-center justify-center rounded-[4px] bg-primary px-2 py-[2px] text-xs font-medium text-white">
                  {job.statusLabel}
                </span>
              </div>
              <span className="inline-flex rounded-[4px] bg-[rgba(30,102,247,0.1)] px-1 py-0.5 text-xs font-semibold uppercase text-primary">
                {job.department}
              </span>
            </div>

            <div className="flex items-center gap-6">
              <span className="inline-flex h-[22px] items-center rounded-[6px] border border-[#d7b350] bg-[#ffe345] px-[9px] py-[3px] text-xs font-medium text-black">
                {job.interviewedCount} Interviewed
              </span>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto cursor-pointer gap-1 p-0 text-xs font-medium tracking-[-0.1504px] text-primary hover:bg-transparent hover:text-primary"
                onClick={() => setIsExpanded((previous) => !previous)}
                aria-expanded={isExpanded}
              >
                {isExpanded ? (
                  <ChevronUp className="h-[14px] w-[14px]" />
                ) : (
                  <ChevronDown className="h-[14px] w-[14px]" />
                )}
                {isExpanded ? 'Less' : 'More'}
              </Button>
            </div>
          </div>
        </div>

        <div
          className={`grid border-t border-[#e5e5e5] transition-[grid-template-rows,opacity] duration-300 ease-out ${
            isExpanded
              ? 'grid-rows-[1fr] opacity-100'
              : 'grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="min-h-0 overflow-hidden">
            <Tabs
              defaultValue="interview"
              className="w-full space-y-4 px-6 pb-6 pt-4"
            >
              <TopTriggers
                onInterviewCount={job.onInterviewCount}
                shortlistedCount={job.shortlistedCount}
                waitlistedCount={job.waitlistedCount}
              />

              <TabsContent value="interview" className="mt-0">
                <InterviewTab
                  interviews={interviews}
                  committeeMembers={committeeMembers}
                  onSetupCommittee={() => setIsCommitteeDialogOpen(true)}
                  onSelectApplicant={setSelectedApplicantId}
                />
              </TabsContent>
              <TabsContent value="shortlisted" className="mt-0">
                <ShortlistedTab job={job} />
              </TabsContent>
              <TabsContent value="waitlisted" className="mt-0">
                <WaitlistedTab job={job} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </article>

      <SetupCommitteeDialog
        open={isCommitteeDialogOpen}
        jobTitle={job.title}
        people={ongoingCommitteePeople}
        selectedPeople={committeeMembers}
        onOpenChange={setIsCommitteeDialogOpen}
        onSave={handleSaveCommittee}
      />
      <InterviewReviewDialog
        open={selectedApplicant !== null}
        applicant={selectedApplicant}
        committeeMembers={committeeMembers}
        currentUserName={currentUserName}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedApplicantId(null);
          }
        }}
        onSubmit={handleInterviewDecision}
      />
    </>
  );
}
