"use client";

import { BarChart3, Sparkles } from "lucide-react";

import type { ActiveJobItem } from "@/features/hr/recruitment/active-posting/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";

type AnalyticsForJobsProps = {
  jobs: ActiveJobItem[];
  selectedJobId: string;
  onSelectJob: (jobId: string) => void;
};

export function AnalyticsForJobs({ jobs, selectedJobId, onSelectJob }: AnalyticsForJobsProps) {
  return (
    <article className="rounded-[8px] border border-primary bg-[rgba(30,102,247,0.05)] p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-[17px] w-[17px] items-center justify-center rounded-full bg-primary text-white">
            <BarChart3 className="h-[10px] w-[10px]" />
          </span>
          <p className="text-xs font-medium text-primary">Analytics for Jobs</p>
        </div>
        <Sparkles className="h-4 w-4 text-primary" />
      </div>

      <div className="mt-6">
        <label htmlFor="analytics-job-select" className="text-sm tracking-[-0.2px] text-[#666]">
          Choose job
        </label>
        <div className="mt-2">
          <Select value={selectedJobId} onValueChange={onSelectJob}>
            <SelectTrigger
              id="analytics-job-select"
              className="h-auto w-full rounded-[6px] border-[#e5e5e5] bg-white px-3 py-4 text-sm text-black"
            >
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
