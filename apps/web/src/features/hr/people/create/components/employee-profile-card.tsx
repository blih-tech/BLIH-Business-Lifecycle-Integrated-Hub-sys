import { CalendarClock, Copy, History, Trash2 } from "lucide-react";
import Image from "next/image";

import type { EmployeeDraftProfile } from "@/features/hr/people/create/types";
import { Button } from "@/shared/components/ui/button";

type EmployeeProfileCardProps = {
  draft: EmployeeDraftProfile;
};

export function EmployeeProfileCard({ draft }: EmployeeProfileCardProps) {
  return (
    <article className="w-full max-w-[464px] rounded-[12px] border border-[#e5e5e5] bg-white p-6">
      <h3 className="text-[28px] font-normal tracking-[-0.4395px] text-black">{draft.title}</h3>

      <div className="mt-4 rounded-[10px] border border-[#ececec] bg-[#f9f9f9] p-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#777]">Basic Info</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div className="rounded-[8px] border border-[#ececec] bg-white p-2.5">
            <div className="flex items-center gap-1.5 text-[#666]">
              <CalendarClock className="h-3.5 w-3.5" />
              <p className="text-[11px] leading-4">Created</p>
            </div>
            <p className="mt-1 text-sm font-medium tracking-[-0.1504px] text-black">{draft.createdAt}</p>
          </div>
          <div className="rounded-[8px] border border-[#ececec] bg-white p-2.5">
            <div className="flex items-center gap-1.5 text-[#666]">
              <History className="h-3.5 w-3.5" />
              <p className="text-[11px] leading-4">Last Updated</p>
            </div>
            <p className="mt-1 text-sm font-medium tracking-[-0.1504px] text-black">{draft.updatedAt}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-[8px] border border-[#ececec] bg-[#f8f8f8]">
        <Image
          src={draft.previewImage}
          alt={`${draft.title} preview`}
          width={414}
          height={170}
          className="h-[170px] w-full object-cover object-top"
        />
      </div>

      <div className="mt-4 flex items-center gap-4">
        <Button type="button" className="h-8 rounded-[6px] px-4 text-sm font-medium tracking-[-0.1504px]">
          Complete
        </Button>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="icon" className="h-8 w-8 rounded-[6px] border-[#e5e5e5]">
            <Copy className="h-4 w-4 text-[#666]" />
          </Button>
          <Button type="button" variant="outline" size="icon" className="h-8 w-8 rounded-[6px] border-[#e5e5e5]">
            <Trash2 className="h-4 w-4 text-[#666]" />
          </Button>
        </div>
      </div>
    </article>
  );
}
