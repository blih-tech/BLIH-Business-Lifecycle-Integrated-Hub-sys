"use client";

import Link from "next/link";

import type { CareerJob } from "@/features/careers/data";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

type CareerJobDetailDialogProps = {
  job: CareerJob | null;
  onOpenChange: (open: boolean) => void;
};

type ListSectionProps = {
  title: string;
  items: string[];
  emptyLabel?: string;
};

function ListSection({ title, items, emptyLabel = "Not provided" }: ListSectionProps) {
  return (
    <section className="space-y-3 rounded-2xl border border-border/70 bg-card px-4 py-4">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {items.length > 0 ? (
        <div className="grid gap-2">
          {items.map((item) => (
            <div
              key={`${title}-${item}`}
              className="rounded-lg border border-border/70 bg-background px-3 py-2 text-sm text-foreground"
            >
              {item}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      )}
    </section>
  );
}

export function CareerJobDetailDialog({ job, onOpenChange }: CareerJobDetailDialogProps) {
  return (
    <Dialog open={job !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] w-[97vw] overflow-y-auto p-0 sm:max-w-[980px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-2">
        {job ? (
          <>
            <DialogHeader className="border-b border-border/70 bg-muted/20 px-5 py-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-md border border-border bg-background px-2 py-0.5 text-[11px] font-medium text-foreground">
                  {job.departmentLabel}
                </span>
                <span className="inline-flex rounded-md border border-border bg-background px-2 py-0.5 text-[11px] text-muted-foreground">
                  {job.employmentTypeLabel}
                </span>
                <span className="inline-flex rounded-md border border-border bg-background px-2 py-0.5 text-[11px] text-muted-foreground">
                  {job.workModeLabel}
                </span>
                <span className="inline-flex rounded-md border border-border bg-background px-2 py-0.5 text-[11px] text-muted-foreground">
                  {job.experienceLevelLabel}
                </span>
              </div>
              <DialogTitle className="pt-2 text-xl font-semibold tracking-tight text-foreground">
                {job.title}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {job.location} · {job.salaryLabel}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 px-5 py-5 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-4">
                <section className="rounded-2xl border border-border/70 bg-card px-4 py-4">
                  <p className="text-sm font-semibold text-foreground">About the role</p>
                  <p className="mt-2 text-sm leading-6 text-foreground">{job.summary}</p>
                </section>

                {job.whyJoinUs ? (
                  <section className="rounded-2xl border border-border/70 bg-card px-4 py-4">
                    <p className="text-sm font-semibold text-foreground">Why join us</p>
                    <p className="mt-2 text-sm leading-6 text-foreground">{job.whyJoinUs}</p>
                  </section>
                ) : null}

                <div className="grid gap-4 xl:grid-cols-2">
                  <ListSection title="Key Responsibilities" items={job.keyResponsibilities} />
                  <ListSection title="Requirements" items={job.requirements} />
                </div>
              </div>

              <div className="space-y-4">
                <ListSection title="Preferred Skills" items={job.preferredSkills} />
                <ListSection title="Benefits" items={job.benefits} />
              </div>
            </div>

            <DialogFooter className="border-t border-border/70 px-5 py-4">
              <Button asChild>
                <Link href={`/careers/${job.slug}`}>Apply</Link>
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
