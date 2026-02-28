"use client";

import { BarChart3 } from "lucide-react";

import type { ActiveJobItem } from "@/features/hr/recruitment/active-posting/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";

type AnalyticsForJobsProps = {
  jobs: ActiveJobItem[];
  selectedJobId: string;
  onSelectJob: (jobId: string) => void;
};

export function AnalyticsForJobs({ jobs, selectedJobId, onSelectJob }: AnalyticsForJobsProps) {
  return (
    <article className="rounded-[12px] border border-[#e5e5e5] bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-[6px] bg-primary text-white">
            <BarChart3 className="h-4 w-4" />
          </span>
          <p className="text-base font-medium tracking-[-0.3125px] text-black">Analytics for Jobs</p>
        </div>
      </div>

      <div className="mt-6">
        <label htmlFor="analytics-job-select" className="text-sm tracking-[-0.1504px] text-[#666]">
          Choose job
        </label>
        <div className="mt-2">
          <Select value={selectedJobId} onValueChange={onSelectJob}>
            <SelectTrigger id="analytics-job-select" className="w-full border-[#e5e5e5] bg-white text-sm text-black">
              <SelectValue placeholder="Select a job" />
            </SelectTrigger>
            <SelectContent>
            {jobs.map((job) => (
              <SelectItem key={job.id} value={job.id}>
                {job.title}
              </SelectItem>
            ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </article>
  );
}
