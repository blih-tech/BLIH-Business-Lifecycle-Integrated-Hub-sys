import { CheckSquare, Copy, Pencil, Trash2 } from "lucide-react";

import type { ChecklistTemplate } from "@/features/hr/onboarding/checklists/types";
import { Button } from "@/shared/components/ui/button";

type ChecklistCardProps = {
  checklist: ChecklistTemplate;
};

export function ChecklistCard({ checklist }: ChecklistCardProps) {
  return (
    <article className="rounded-[12px] border border-[#e5e5e5] bg-white p-4">
      <div className="space-y-1">
        <h3 className="text-base font-medium tracking-[-0.3125px] text-black">{checklist.title}</h3>
        <span className="inline-flex rounded-[4px] bg-[rgba(30,102,247,0.1)] px-1 py-0.5 text-[10px] font-semibold uppercase text-primary">
          {checklist.department}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-x-2 gap-y-1.5 rounded-[8px] bg-[#f5f5f5] p-2.5">
        <div>
          <p className="text-[10px] leading-4 text-[#666]">Total Items</p>
          <p className="text-sm font-semibold tracking-[-0.1504px] text-black">{checklist.totalItems}</p>
        </div>
        <div>
          <p className="text-[10px] leading-4 text-[#666]">Times Used</p>
          <p className="text-sm font-semibold tracking-[-0.1504px] text-black">{checklist.timesUsed}</p>
        </div>
        <div>
          <p className="text-[10px] leading-4 text-[#666]">Created</p>
          <p className="text-xs font-medium tracking-[-0.1504px] text-black">{checklist.createdAt}</p>
        </div>
        <div>
          <p className="text-[10px] leading-4 text-[#666]">Last Used</p>
          <p className="text-xs font-medium tracking-[-0.1504px] text-black">{checklist.lastUsedAt}</p>
        </div>
      </div>

      <div className="mt-3 rounded-[8px] bg-[#f5f5f5] px-2.5 pt-2.5 pb-2">
        <p className="text-xs font-medium tracking-[-0.1504px] text-black">Checklist Items:</p>
        <ul className="mt-1 space-y-1">
          {checklist.items.map((item) => (
            <li key={item} className={`text-xs tracking-[-0.1504px] ${item.startsWith("+") ? "font-medium text-primary" : "text-[#666]"}`}>
              {item.startsWith("+") ? item : (
                <>
                  <CheckSquare className="mr-1 inline h-3 w-3 text-primary" />
                  {item}
                </>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-3 flex items-center gap-2.5">
        <Button type="button" className="h-7 rounded-[6px] px-3 text-xs font-medium tracking-[-0.1504px]">
          Use This Checklist
        </Button>
        <div className="flex items-center gap-2">
          <button type="button" className="grid h-7 w-7 place-items-center rounded-[6px] border border-[#e5e5e5] bg-white text-[#666]">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button type="button" className="grid h-7 w-7 place-items-center rounded-[6px] border border-[#e5e5e5] bg-white text-[#666]">
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button type="button" className="grid h-7 w-7 place-items-center rounded-[6px] border border-[#e5e5e5] bg-white text-[#666]">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
}
