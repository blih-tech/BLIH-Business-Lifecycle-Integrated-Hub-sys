import { Clock3, Star, UsersRound } from 'lucide-react';

import type {
  OngoingCommitteePerson,
  OngoingRecruitmentJob,
} from '@/features/hr/recruitment/ongoing-recruitment/types';
import { Button } from '@/shared/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';

type InterviewTabProps = {
  interviews: OngoingRecruitmentJob['interviews'];
  committeeMembers: OngoingCommitteePerson[];
  onSetupCommittee: () => void;
  onSelectApplicant: (applicantId: string) => void;
};

export function InterviewTab({
  interviews,
  committeeMembers,
  onSetupCommittee,
  onSelectApplicant,
}: InterviewTabProps) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-[6px] border border-[#d7b350] bg-[#ffe345]">
            <Clock3 className="h-4 w-4 text-black" />
          </span>
          <p className="text-base font-medium tracking-[-0.3125px] text-black">
            Interviews
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 px-3 text-xs"
          onClick={onSetupCommittee}
        >
          Setup Committees
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-[6px] bg-black text-white">
            <UsersRound className="h-4 w-4" />
          </span>
          <p className="text-sm font-medium text-black">Committee</p>
        </div>

        {committeeMembers.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {committeeMembers.map((member) => (
              <span
                key={member.id}
                className="inline-flex items-center gap-2 rounded-[8px] border border-[#e5e5e5] bg-[#fafafa] px-3 py-2 text-xs text-black"
              >
                <span className="font-medium">{member.fullName}</span>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#666]">
            No committee members configured yet.
          </p>
        )}
      </div>

      <div className="overflow-hidden rounded-[8px] border border-[#e5e5e5] bg-white">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-4 py-3 text-xs font-semibold uppercase text-primary">
                Name of Applicant
              </TableHead>
              <TableHead className="px-4 py-3 text-xs font-semibold uppercase text-primary">
                Interview Schedule
              </TableHead>
              <TableHead className="px-4 py-3 text-xs font-semibold uppercase text-primary">
                Status
              </TableHead>
              <TableHead className="px-4 py-3 text-xs font-semibold uppercase text-primary">
                Rating
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {interviews.map((item) => (
              <TableRow
                key={item.id}
                className="group cursor-pointer bg-white transition-colors duration-200 hover:bg-[#f3f3f3]"
                onClick={() => onSelectApplicant(item.id)}
              >
                <TableCell className="px-4 py-3 group-hover:bg-transparent">
                  <p className="text-base font-medium tracking-[-0.3125px] text-black">
                    {item.fullName}
                  </p>
                  <p className="text-xs text-[#666]">{item.phone}</p>
                </TableCell>

                <TableCell className="px-4 py-3 group-hover:bg-transparent">
                  {item.interviewStatus === 'interviewed' ? (
                    <span className="inline-flex h-[22px] w-fit items-center rounded-[6px] border border-[#e5e5e5] bg-[#f3f3f3] px-[9px] py-[3px] text-xs font-medium text-black">
                      Interviewed
                    </span>
                  ) : (
                    <div>
                      <p className="text-sm tracking-[-0.1504px] text-[#666]">
                        {item.interviewDate}
                      </p>
                      <p className="text-xs text-[#666]">
                        {item.interviewTime}
                      </p>
                    </div>
                  )}
                </TableCell>

                <TableCell className="px-4 py-3 group-hover:bg-transparent">
                  <span
                    className={`inline-flex h-[22px] w-fit items-center rounded-[6px] px-[9px] py-[3px] text-xs font-medium ${
                      item.status === 'waitlisted'
                        ? 'border border-[#e5e5e5] bg-[#f3f3f3] text-black'
                        : 'border border-[#d7b350] bg-[#fff7cc] text-black'
                    }`}
                  >
                    {item.status === 'waitlisted' ? 'Waitlisted' : 'Pending'}
                  </span>
                </TableCell>

                <TableCell className="px-4 py-3 group-hover:bg-transparent">
                  <span className="inline-flex h-[22px] w-fit items-center gap-1 rounded-[4px] border border-primary px-[5px] py-[3px] text-[10px] font-bold text-primary">
                    <Star className="h-2.5 w-2.5 fill-[#ffe345] text-[#ffe345]" />
                    {item.rating}%
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
