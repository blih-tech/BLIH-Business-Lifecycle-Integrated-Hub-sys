"use client";

import { useMemo, useState } from "react";

import type { ActiveJobItem } from "@/features/hr/recruitment/active-posting/types";
import { Button } from "@/shared/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";

type ApplicantsTabProps = {
  job: ActiveJobItem;
};

const APPLICANTS_PER_PAGE = 10;

export function ApplicantsTab({ job }: ApplicantsTabProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(job.applicants.length / APPLICANTS_PER_PAGE));
  const paginatedApplicants = useMemo(() => {
    const startIndex = (currentPage - 1) * APPLICANTS_PER_PAGE;
    return job.applicants.slice(startIndex, startIndex + APPLICANTS_PER_PAGE);
  }, [currentPage, job.applicants]);

  return (
    <section className="space-y-2 px-6">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="px-4 py-3 text-xs font-semibold uppercase text-primary">Name of Applicant</TableHead>
            <TableHead className="px-4 py-3 text-xs font-semibold uppercase text-primary">Applied Date</TableHead>
            <TableHead className="px-4 py-3 text-xs font-semibold uppercase text-primary">Year of Experience</TableHead>
            <TableHead className="px-4 py-3 text-xs font-semibold uppercase text-primary">Salary Expectation</TableHead>
            <TableHead className="px-4 py-3 text-right text-xs font-semibold uppercase text-primary">AI Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedApplicants.map((applicant) => (
            <TableRow
              key={applicant.id}
              className="group border-0 bg-white transition-colors duration-200 hover:bg-[#f8fbff]"
            >
              <TableCell className="px-4 py-3 transition-colors duration-200 group-hover:bg-transparent">
                <div className="space-y-0.5">
                  <p className="text-base font-medium tracking-[-0.3125px] text-black">{applicant.fullName}</p>
                  <p className="text-xs text-[#666]">{applicant.phone}</p>
                </div>
              </TableCell>
              <TableCell className="px-4 py-3 text-sm tracking-[-0.1504px] text-[#666] transition-colors duration-200 group-hover:bg-transparent">
                {applicant.appliedAt}
              </TableCell>
              <TableCell className="px-4 py-3 text-sm tracking-[-0.1504px] text-[#666] transition-colors duration-200 group-hover:bg-transparent">
                {applicant.yearsOfExperience}
              </TableCell>
              <TableCell className="px-4 py-3 text-sm tracking-[-0.1504px] text-[#666] transition-colors duration-200 group-hover:bg-transparent">
                {applicant.salaryExpectation}
              </TableCell>
              <TableCell className="px-4 py-3 text-right transition-colors duration-200 group-hover:bg-transparent">
                <span className="inline-flex rounded-[6px] bg-[rgba(30,102,247,0.1)] px-[9px] py-[3px] text-xs font-medium text-primary">
                  {applicant.aiScore}%
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
        <p className="text-sm text-[#666]">
          Page {currentPage} of {totalPages}
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 cursor-pointer text-xs"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
          >
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 cursor-pointer text-xs"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
          >
            Next
          </Button>
        </div>
      </div>
    </section>
  );
}
