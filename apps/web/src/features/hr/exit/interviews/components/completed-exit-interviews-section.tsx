"use client";

import { Search } from "lucide-react";

import type { CompletedInterview } from "@/features/hr/exit/interviews/types";
import { Input } from "@/shared/components/ui/input";

import { CompletedInterviewCard } from "./completed-interview-card";

type CompletedExitInterviewsSectionProps = {
  items: CompletedInterview[];
};

export function CompletedExitInterviewsSection({ items }: CompletedExitInterviewsSectionProps) {
  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-base font-medium tracking-[-0.176px] text-black">Completed Exit Interviews</p>
        <div className="relative w-full sm:w-[184px]">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-primary" />
          <Input className="h-8 rounded-[6px] border-[#e5e5e5] pl-8 text-xs" placeholder="Search" />
        </div>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <CompletedInterviewCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
