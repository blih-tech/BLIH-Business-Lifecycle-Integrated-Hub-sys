import type { ActiveJobItem } from "@/features/hr/recruitment/active-posting/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";

type ApplicantsTabProps = {
  job: ActiveJobItem;
};

export function ApplicantsTab({ job }: ApplicantsTabProps) {
  return (
    <section className="space-y-2 px-6">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="px-4 py-3 text-xs font-semibold uppercase text-primary">Name of Applicant</TableHead>
            <TableHead className="px-4 py-3 text-xs font-semibold uppercase text-primary">Applied Date</TableHead>
            <TableHead className="px-4 py-3 text-xs font-semibold uppercase text-primary">Year of Experience</TableHead>
            <TableHead className="px-4 py-3 text-xs font-semibold uppercase text-primary">Salary Expectation</TableHead>
            <TableHead className="px-4 py-3 text-right text-xs font-semibold uppercase text-primary">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {job.applicants.map((applicant) => (
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
                {applicant.status === "new" ? (
                  <span className="inline-flex h-[22px] items-center rounded-[6px] bg-primary px-[9px] py-[3px] text-xs font-medium text-white">
                    New
                  </span>
                ) : (
                  <span className="text-xs font-medium text-[rgba(0,0,0,0.7)]">Reviewed</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
}
