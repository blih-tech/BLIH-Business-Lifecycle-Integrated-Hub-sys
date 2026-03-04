import { Copy, Eye, FileText, Pencil, Trash2 } from "lucide-react";

import type { CreatedApplicantForm } from "@/features/hr/recruitment/applicant-forms/types";

type FormCardProps = {
  form: CreatedApplicantForm;
};

function IconAction({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="inline-flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#e5e5e5] bg-white text-[#666] transition-colors hover:bg-[#f8f8f8]"
      aria-label="form action"
    >
      {children}
    </button>
  );
}

export function FormCard({ form }: FormCardProps) {
  return (
    <article className="rounded-[12px] border border-[#e5e5e5] bg-white px-6 py-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-[rgba(30,102,247,0.1)] text-primary">
            <FileText className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-base font-semibold tracking-[-0.3125px] text-black">{form.title}</p>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm tracking-[-0.1504px] text-[#666]">
              <span>{form.department}</span>
              <span>
                Created: <span className="font-semibold text-black">{form.createdAt}</span>
              </span>
              <span>
                Used in: <span className="font-semibold text-black">{form.usedInJobs} Jobs</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <IconAction>
            <Eye className="h-4 w-4" />
          </IconAction>
          <IconAction>
            <Pencil className="h-4 w-4" />
          </IconAction>
          <IconAction>
            <Copy className="h-4 w-4" />
          </IconAction>
          <IconAction>
            <Trash2 className="h-4 w-4" />
          </IconAction>
        </div>
      </div>
    </article>
  );
}

