import { CheckSquare, Copy, Pencil, Trash2 } from "lucide-react";

import type { ChecklistTemplate } from "@/features/hr/onboarding/checklists/types";
import { Button } from "@/shared/components/ui/button";

type ChecklistCardProps = {
  checklist: ChecklistTemplate;
};

export function ChecklistCard({ checklist }: ChecklistCardProps) {
  return (
    <article className="rounded-[12px] border border-[#e5e5e5] bg-white p-5">
      <div className="space-y-1">
        <h3 className="text-lg font-medium tracking-[-0.3125px] text-black">{checklist.title}</h3>
        <span className="inline-flex rounded-[4px] bg-[rgba(30,102,247,0.1)] px-1 py-0.5 text-xs font-semibold uppercase text-primary">
          {checklist.department}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 rounded-[8px] bg-[#f5f5f5] p-3">
        <div>
          <p className="text-xs leading-4 text-[#666]">Total Items</p>
          <p className="text-base font-semibold tracking-[-0.3125px] text-black">{checklist.totalItems}</p>
        </div>
        <div>
          <p className="text-xs leading-4 text-[#666]">Times Used</p>
          <p className="text-base font-semibold tracking-[-0.3125px] text-black">{checklist.timesUsed}</p>
        </div>
        <div>
          <p className="text-xs leading-4 text-[#666]">Created</p>
          <p className="text-sm font-medium tracking-[-0.1504px] text-black">{checklist.createdAt}</p>
        </div>
        <div>
          <p className="text-xs leading-4 text-[#666]">Last Used</p>
          <p className="text-sm font-medium tracking-[-0.1504px] text-black">{checklist.lastUsedAt}</p>
        </div>
      </div>

      <div className="mt-4 rounded-[8px] bg-[#f5f5f5] px-3 pt-3 pb-2">
        <p className="text-sm font-medium tracking-[-0.1504px] text-black">Checklist Items:</p>
        <ul className="mt-1 space-y-1">
          {checklist.items.map((item) => (
            <li key={item} className={`text-sm tracking-[-0.1504px] ${item.startsWith("+") ? "font-medium text-primary" : "text-[#666]"}`}>
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

      <div className="mt-3.5 flex items-center gap-3">
        <Button type="button" className="h-8 rounded-[6px] px-4 text-sm font-medium tracking-[-0.1504px]">
          Use This Checklist
        </Button>
        <div className="flex items-center gap-2">
          <button type="button" className="grid h-8 w-8 place-items-center rounded-[6px] border border-[#e5e5e5] bg-white text-[#666]">
            <Pencil className="h-4 w-4" />
          </button>
          <button type="button" className="grid h-8 w-8 place-items-center rounded-[6px] border border-[#e5e5e5] bg-white text-[#666]">
            <Copy className="h-4 w-4" />
          </button>
          <button type="button" className="grid h-8 w-8 place-items-center rounded-[6px] border border-[#e5e5e5] bg-white text-[#666]">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
