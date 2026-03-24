'use client';

import { useEffect, useMemo, useState } from 'react';

import type {
  OngoingCommitteePerson,
  OngoingCommitteeReview,
  OngoingInterviewApplicant,
} from '@/features/hr/recruitment/ongoing-recruitment/types';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';

type InterviewReviewDialogProps = {
  applicant: OngoingInterviewApplicant | null;
  committeeMembers: OngoingCommitteePerson[];
  currentUserName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: {
    applicantId: string;
    action: 'reject' | 'offer' | 'waitlist';
    reviews: OngoingCommitteeReview[];
  }) => void;
};

type ReviewRow = {
  memberId: string;
  memberName: string;
  note: string;
  rate: number | null;
};

function namesEqual(left: string, right: string) {
  return left.trim().toLowerCase() === right.trim().toLowerCase();
}

export function InterviewReviewDialog({
  applicant,
  committeeMembers,
  currentUserName,
  open,
  onOpenChange,
  onSubmit,
}: InterviewReviewDialogProps) {
  const [draftReviews, setDraftReviews] = useState<ReviewRow[]>([]);

  const reviewMembers = useMemo(() => {
    if (!applicant) return [];

    if (committeeMembers.length > 0) {
      return committeeMembers.map((member) => {
        const existing = applicant.committeeReviews.find(
          (review) => review.memberId === member.id,
        );
        return {
          memberId: member.id,
          memberName: member.fullName,
          note: existing?.note ?? '',
          rate: existing?.rate ?? null,
        };
      });
    }

    return applicant.committeeReviews.map((review) => ({
      memberId: review.memberId,
      memberName: review.memberName,
      note: review.note,
      rate: review.rate,
    }));
  }, [applicant, committeeMembers]);

  useEffect(() => {
    if (open) {
      setDraftReviews(reviewMembers);
    }
  }, [open, reviewMembers]);

  function updateCurrentUserReview(
    patch: Partial<Pick<ReviewRow, 'note' | 'rate'>>,
  ) {
    setDraftReviews((current) =>
      current.map((review) =>
        namesEqual(review.memberName, currentUserName)
          ? {
              ...review,
              ...patch,
            }
          : review,
      ),
    );
  }

  function handleAction(action: 'reject' | 'offer' | 'waitlist') {
    if (!applicant) return;

    onSubmit({
      applicantId: applicant.id,
      action,
      reviews: draftReviews,
    });
    onOpenChange(false);
  }

  const currentUserReview = draftReviews.find((review) =>
    namesEqual(review.memberName, currentUserName),
  );
  const otherReviews = draftReviews.filter(
    (review) => !namesEqual(review.memberName, currentUserName),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-hidden p-0 sm:max-w-[1080px]">
        <DialogHeader className="border-b border-[#e5e5e5] px-6 py-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <DialogTitle className="text-[22px] tracking-[-0.4px]">
                {applicant?.fullName ?? 'Candidate Review'}
              </DialogTitle>
              <DialogDescription>{applicant?.phone ?? ''}</DialogDescription>
            </div>

            {applicant ? (
              <div className="min-w-[160px] rounded-[10px] border border-[#e5e5e5] bg-[#fafafa] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-primary">
                  Average Rating
                </p>
                <p className="mt-1 text-sm font-medium text-black">
                  {applicant.rating}%
                </p>
              </div>
            ) : null}
          </div>
        </DialogHeader>

        <div className="grid max-h-[calc(90vh-190px)] gap-0 overflow-hidden lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4 overflow-y-auto border-b border-[#e5e5e5] px-6 py-5 lg:border-b-0 lg:border-r">
            {currentUserReview ? (
              <div className="space-y-4 rounded-[14px] border border-[#e5e5e5] bg-[#fcfcfc] p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-primary">
                      Your Review
                    </p>
                    <p className="mt-1 text-base font-medium text-black">
                      {currentUserReview.memberName}
                    </p>
                  </div>
                  <span className="inline-flex h-7 items-center rounded-[8px] border border-primary/30 bg-primary/5 px-3 text-xs font-semibold text-primary">
                    {currentUserReview.rate !== null
                      ? `${currentUserReview.rate}/100`
                      : 'Pending'}
                  </span>
                </div>

                <div className="grid gap-4 md:grid-cols-[180px_1fr]">
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase text-primary">
                      Rate
                    </p>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={currentUserReview.rate ?? ''}
                      onChange={(event) => {
                        const value = event.target.value;
                        updateCurrentUserReview({
                          rate: value === '' ? null : Number(value),
                        });
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase text-primary">
                      Note
                    </p>
                    <Textarea
                      value={currentUserReview.note}
                      onChange={(event) =>
                        updateCurrentUserReview({ note: event.target.value })
                      }
                      className="min-h-[180px] resize-none"
                      placeholder="Add your interview note"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-[14px] border border-[#e5e5e5] bg-[#fcfcfc] p-5">
                <p className="text-sm text-[#666]">
                  You are not part of this committee. Other reviews are
                  read-only.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4 overflow-y-auto px-6 py-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-primary">
                  Committee Reviews
                </p>
                <p className="mt-1 text-sm text-[#666]">
                  Other committee members&apos; notes and scores.
                </p>
              </div>
              <span className="text-xs font-medium text-[#666]">
                {draftReviews.length} reviewers
              </span>
            </div>

            {draftReviews.length > 0 ? (
              <div className="space-y-3">
                {otherReviews.map((review) => (
                  <div
                    key={review.memberId}
                    className="rounded-[12px] border border-[#e5e5e5] bg-white p-4"
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-black">
                        {review.memberName}
                      </p>
                      {review.rate !== null ? (
                        <span className="inline-flex h-6 items-center rounded-[6px] border border-[#e5e5e5] bg-[#fafafa] px-2 text-xs font-semibold text-black">
                          {review.rate}/100
                        </span>
                      ) : (
                        <span className="text-xs text-[#666]">Not rated</span>
                      )}
                    </div>
                    <div className="rounded-md border border-[#e5e5e5] bg-[#fafafa] px-3 py-2 text-sm text-[#666]">
                      {review.note || 'No note added yet.'}
                    </div>
                  </div>
                ))}
                {otherReviews.length === 0 ? (
                  <div className="rounded-[12px] border border-dashed border-[#e5e5e5] px-4 py-6 text-sm text-[#666]">
                    No other reviews yet.
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-[#666]">
                No committee people added for this interview yet.
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="border-t border-[#e5e5e5] px-6 py-4 sm:justify-between">
          <div className="text-sm text-[#666]">
            {applicant?.interviewStatus === 'scheduled'
              ? 'Candidate is scheduled for interview.'
              : 'Candidate interview is complete.'}
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleAction('reject')}
            >
              Reject
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleAction('waitlist')}
            >
              Waitlist
            </Button>
            <Button type="button" onClick={() => handleAction('offer')}>
              Offer
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
