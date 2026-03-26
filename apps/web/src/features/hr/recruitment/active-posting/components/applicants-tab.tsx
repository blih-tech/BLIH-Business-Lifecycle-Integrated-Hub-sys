"use client";

import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";

import { ScheduleInterviewDialog } from "@/features/hr/recruitment/active-posting/components/schedule-interview-dialog";
import { CandidateDetailDialog } from "@/features/hr/recruitment/ongoing-recruitment/components/candidate-detail-dialog";
import type { ActiveJobItem } from "@/features/hr/recruitment/active-posting/types";
import { Button } from "@/shared/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";

type ApplicantsTabProps = {
  job: ActiveJobItem;
  historyMode?: boolean;
};

const APPLICANTS_PER_PAGE = 10;

type SortKey = "name" | "appliedAt" | "yearsOfExperience" | "salaryExpectation" | "aiScore";
type SortDirection = "asc" | "desc";

function parseExperience(value: string) {
  return Number.parseInt(value, 10) || 0;
}

function parseSalary(value: string) {
  return Number.parseFloat(value.replace(/,/g, "")) || 0;
}

function getComparableValue(applicant: ActiveJobItem["applicants"][number], key: SortKey) {
  if (key === "name") return applicant.fullName.toLowerCase();
  if (key === "appliedAt") return new Date(applicant.appliedAt).getTime();
  if (key === "yearsOfExperience") return parseExperience(applicant.yearsOfExperience);
  if (key === "salaryExpectation") return parseSalary(applicant.salaryExpectation);
  return applicant.aiScore;
}

function SortHeader({
  label,
  sortKey,
  activeSortKey,
  direction,
  onSort,
  align = "left",
}: {
  label: string;
  sortKey: SortKey;
  activeSortKey: SortKey;
  direction: SortDirection;
  onSort: (key: SortKey) => void;
  align?: "left" | "right";
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={`h-auto cursor-pointer gap-1 px-0 py-0 text-xs font-semibold uppercase text-primary hover:bg-transparent hover:text-primary ${
        align === "right" ? "ml-auto flex" : ""
      }`}
      onClick={() => onSort(sortKey)}
    >
      {label}
      <ChevronDown
        className={`h-3 w-3 transition-transform ${
          activeSortKey === sortKey ? "text-primary opacity-100" : "opacity-30"
        } ${activeSortKey === sortKey && direction === "asc" ? "rotate-180" : ""}`}
      />
    </Button>
  );
}

export function ApplicantsTab({ job, historyMode = false }: ApplicantsTabProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>("appliedAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedApplicantIds, setSelectedApplicantIds] = useState<string[]>([]);
  const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(null);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [viewedApplicantIds, setViewedApplicantIds] = useState<Set<string>>(new Set());

  const sortedApplicants = useMemo(() => {
    return [...job.applicants].sort((left, right) => {
      const leftValue = getComparableValue(left, sortKey);
      const rightValue = getComparableValue(right, sortKey);

      if (leftValue < rightValue) return sortDirection === "asc" ? -1 : 1;
      if (leftValue > rightValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [job.applicants, sortDirection, sortKey]);

  const totalPages = Math.max(1, Math.ceil(sortedApplicants.length / APPLICANTS_PER_PAGE));
  const paginatedApplicants = useMemo(() => {
    const startIndex = (currentPage - 1) * APPLICANTS_PER_PAGE;
    return sortedApplicants.slice(startIndex, startIndex + APPLICANTS_PER_PAGE);
  }, [currentPage, sortedApplicants]);
  const allVisibleSelected =
    paginatedApplicants.length > 0 &&
    paginatedApplicants.every((applicant) => selectedApplicantIds.includes(applicant.id));

  function handleSort(nextSortKey: SortKey) {
    setCurrentPage(1);
    if (sortKey === nextSortKey) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(nextSortKey);
    setSortDirection("asc");
  }

  function toggleApplicantSelection(applicantId: string, checked: boolean) {
    setSelectedApplicantIds((current) =>
      checked ? [...new Set([...current, applicantId])] : current.filter((id) => id !== applicantId),
    );
  }

  function toggleSelectAllVisible(checked: boolean) {
    const visibleIds = paginatedApplicants.map((applicant) => applicant.id);
    setSelectedApplicantIds((current) =>
      checked
        ? [...new Set([...current, ...visibleIds])]
        : current.filter((id) => !visibleIds.includes(id)),
    );
  }

  function handleBulkAction(action: "summon_for_interview" | "shortlist" | "reject") {
    const selectedApplicants = job.applicants.filter((applicant) => selectedApplicantIds.includes(applicant.id));

    if (action === "summon_for_interview") {
      setIsScheduleDialogOpen(true);
      return;
    }

    console.log("activePostingApplicantAction", {
      action,
      applicantIds: selectedApplicantIds,
      applicants: selectedApplicants,
    });
  }

  const selectedApplicants = job.applicants.filter((applicant) => selectedApplicantIds.includes(applicant.id));
  const selectedApplicant = job.applicants.find((applicant) => applicant.id === selectedApplicantId) ?? null;
  const selectedCandidate = selectedApplicant
    ? {
        id: selectedApplicant.id,
        fullName: selectedApplicant.fullName,
        phone: selectedApplicant.phone,
        listedAt: selectedApplicant.appliedAt,
        rating: selectedApplicant.aiScore,
        answers: selectedApplicant.answers,
        aiAnalysis: selectedApplicant.aiAnalysis,
      }
    : null;

  return (
    <>
      <section className="space-y-2 px-6">
        {!historyMode ? (
          <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 text-sm text-[#666]">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={(event) => toggleSelectAllVisible(event.target.checked)}
                aria-label="Select all applicants on current page"
                className="h-4 w-4 rounded border-border accent-[#1e66f7]"
              />
              <span>Select All</span>
              <span className="text-black">
                {selectedApplicantIds.length}/{job.applicants.length}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                size="sm"
                className="h-8 min-w-[110px] cursor-pointer rounded-[6px] bg-[#1e66f7] px-4 text-xs text-white hover:bg-[#1e66f7]"
                disabled={selectedApplicantIds.length === 0}
                onClick={() => handleBulkAction("shortlist")}
              >
                Shortlist
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 min-w-[120px] cursor-pointer rounded-[6px] border-[#1e66f7] px-4 text-xs text-[#1e66f7] hover:bg-white"
                disabled={selectedApplicantIds.length === 0}
                onClick={() => handleBulkAction("summon_for_interview")}
              >
                Mark Reviewed
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 min-w-[96px] cursor-pointer rounded-[6px] border-[#ff3b30] px-4 text-xs text-[#ff3b30] hover:bg-white"
                disabled={selectedApplicantIds.length === 0}
                onClick={() => handleBulkAction("reject")}
              >
                Reject
              </Button>
            </div>
          </div>
        ) : null}

        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {!historyMode ? <TableHead className="w-12 px-4 py-3" /> : null}
              <TableHead className="px-4 py-3">
                <SortHeader label="Name" sortKey="name" activeSortKey={sortKey} direction={sortDirection} onSort={handleSort} />
              </TableHead>
              <TableHead className="px-4 py-3">
                <SortHeader label="Applied" sortKey="appliedAt" activeSortKey={sortKey} direction={sortDirection} onSort={handleSort} />
              </TableHead>
              <TableHead className="px-4 py-3">
                <SortHeader label="Experience" sortKey="yearsOfExperience" activeSortKey={sortKey} direction={sortDirection} onSort={handleSort} />
              </TableHead>
              <TableHead className="px-4 py-3">
                <SortHeader label="Salary" sortKey="salaryExpectation" activeSortKey={sortKey} direction={sortDirection} onSort={handleSort} />
              </TableHead>
              <TableHead className="px-4 py-3 text-right">
                <SortHeader label="AI Score" sortKey="aiScore" activeSortKey={sortKey} direction={sortDirection} onSort={handleSort} align="right" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedApplicants.map((applicant) => (
              <TableRow
                key={applicant.id}
                className={`group border-0 transition-colors duration-200 hover:cursor-pointer hover:bg-[#f8fbff] ${
                  viewedApplicantIds.has(applicant.id)
                    ? "bg-[#e9f0fe] border-y border-[#1e66f7]"
                    : "bg-white"
                }`}
                onClick={() => {
                  setSelectedApplicantId(applicant.id);
                  setViewedApplicantIds((current) => {
                    const next = new Set(current);
                    next.add(applicant.id);
                    return next;
                  });
                }}
              >
                {!historyMode ? (
                  <TableCell className="w-12 px-4 py-3 transition-colors duration-200 group-hover:bg-transparent">
                    <input
                      type="checkbox"
                      checked={selectedApplicantIds.includes(applicant.id)}
                      onClick={(event) => event.stopPropagation()}
                      onChange={(event) => toggleApplicantSelection(applicant.id, event.target.checked)}
                      aria-label={`Select ${applicant.fullName}`}
                        className="h-4 w-4 rounded border-border accent-[#1e66f7]"
                    />
                  </TableCell>
                ) : null}
                <TableCell className="px-4 py-3 transition-colors duration-200 group-hover:bg-transparent">
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-base font-medium tracking-[-0.3125px] text-black">
                        {applicant.fullName}
                      </p>
                    </div>
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

        <div className="flex items-center justify-center gap-4 border-t border-border pt-4">
          <button
            type="button"
            className="flex h-5 w-5 items-center justify-center text-[#666]"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            aria-label="Previous page"
          >
            <ChevronDown className="h-4 w-4 rotate-90" />
          </button>
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, index) => {
              const pageNumber = index + 1;
              const isActive = pageNumber === currentPage;
              return (
                <button
                  key={`page-${pageNumber}`}
                  type="button"
                  className={`flex h-4 w-4 items-center justify-center rounded-full text-[12px] ${
                    isActive ? "bg-[#1e66f7] text-white" : "text-black"
                  }`}
                  onClick={() => setCurrentPage(pageNumber)}
                >
                  {pageNumber}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            className="flex h-5 w-5 items-center justify-center text-[#666]"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            aria-label="Next page"
          >
            <ChevronDown className="h-4 w-4 -rotate-90" />
          </button>
        </div>
      </section>

      <CandidateDetailDialog
        candidate={selectedCandidate}
        job={job}
        open={selectedCandidate !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedApplicantId(null);
          }
        }}
      />
      <ScheduleInterviewDialog
        open={isScheduleDialogOpen}
        applicants={selectedApplicants}
        onOpenChange={setIsScheduleDialogOpen}
        onProceed={(payload) => {
          console.log("activePostingApplicantAction", {
            action: "summon_for_interview",
            ...payload,
            applicants: selectedApplicants,
          });
        }}
      />
    </>
  );
}
