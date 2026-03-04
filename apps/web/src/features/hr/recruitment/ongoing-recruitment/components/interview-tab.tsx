import { Clock3, Star } from "lucide-react";

import type { OngoingRecruitmentJob } from "@/features/hr/recruitment/ongoing-recruitment/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";

type InterviewTabProps = {
  job: OngoingRecruitmentJob;
};

export function InterviewTab({ job }: InterviewTabProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 border-b border-border pb-4">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-[6px] border border-[#d7b350] bg-[#ffe345]">
          <Clock3 className="h-4 w-4 text-black" />
        </span>
        <p className="text-base font-medium tracking-[-0.3125px] text-black">Interviews</p>
      </div>

      <div className="overflow-hidden rounded-[8px] border border-[#e5e5e5] bg-white">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-4 py-3 text-xs font-semibold uppercase text-primary">Name of Applicant</TableHead>
              <TableHead className="px-4 py-3 text-xs font-semibold uppercase text-primary">Interview Schedule</TableHead>
              <TableHead className="px-4 py-3 text-xs font-semibold uppercase text-primary">Date Applied</TableHead>
              <TableHead className="px-4 py-3 text-xs font-semibold uppercase text-primary">Rating</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {job.interviews.map((item) => (
              <TableRow key={item.id} className="group bg-white transition-colors duration-200 hover:bg-[#f3f3f3]">
                <TableCell className="px-4 py-3 group-hover:bg-transparent">
                  <p className="text-base font-medium tracking-[-0.3125px] text-black">{item.fullName}</p>
                  <p className="text-xs text-[#666]">{item.phone}</p>
                </TableCell>

                <TableCell className="px-4 py-3 group-hover:bg-transparent">
                  {item.interviewStatus === "interviewed" ? (
                    <span className="inline-flex h-[22px] w-fit items-center rounded-[6px] border border-[#e5e5e5] bg-[#f3f3f3] px-[9px] py-[3px] text-xs font-medium text-black">
                      Interviewed
                    </span>
                  ) : (
                    <div>
                      <p className="text-sm tracking-[-0.1504px] text-[#666]">{item.interviewDate}</p>
                      <p className="text-xs text-[#666]">{item.interviewTime}</p>
                    </div>
                  )}
                </TableCell>

                <TableCell className="px-4 py-3 text-sm tracking-[-0.1504px] text-[#666] group-hover:bg-transparent">
                  {item.appliedAt}
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
