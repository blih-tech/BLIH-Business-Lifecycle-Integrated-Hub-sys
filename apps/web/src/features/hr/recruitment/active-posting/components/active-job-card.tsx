'use client';

import { ChevronDown, ChevronUp, Pencil } from 'lucide-react';
import { useState } from 'react';

import { AnalyticsTab } from '@/features/hr/recruitment/active-posting/components/analytics-tab';
import { ApplicantsTab } from '@/features/hr/recruitment/active-posting/components/applicants-tab';
import { JobDetailTab } from '@/features/hr/recruitment/active-posting/components/job-detail-tab';
import type { ActiveJobItem } from '@/features/hr/recruitment/active-posting/types';
import { Button } from '@/shared/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/components/ui/tabs';

type ActiveJobCardProps = {
  job: ActiveJobItem;
  defaultExpanded?: boolean;
  historyMode?: boolean;
};

export function ActiveJobCard({
  job,
  defaultExpanded = false,
  historyMode = false,
}: ActiveJobCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <article className="overflow-hidden rounded-[12px] border border-primary bg-white">
      <div className="space-y-2 border-b border-border px-6 py-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <div className="flex items-center gap-3">
              <h2 className="text-[18px] font-semibold leading-4 tracking-[-0.3125px] text-black">
                {job.title}
              </h2>
              {job.levelTag ? (
                <span className="inline-flex h-[22px] items-center justify-center rounded-[6px] border border-primary px-[9px] py-[3px] text-xs font-medium text-primary">
                  {job.levelTag}
                </span>
              ) : null}
              <span className="inline-flex h-[22px] items-center justify-center rounded-[4px] bg-primary px-2 py-[2px] text-xs font-medium text-white">
                {job.statusLabel}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-[8px] bg-[#f3f3f3] px-4 py-2 text-sm font-semibold tracking-[-0.1504px] text-[#666]">
                {job.applicantsCount} applicants
              </div>
              <div className="rounded-[8px] bg-[#f3f3f3] px-4 py-2 text-sm font-semibold tracking-[-0.1504px] text-[#666]">
                {job.viewsCount} views
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-auto cursor-pointer gap-1 p-0 text-xs font-medium tracking-[-0.1504px] text-primary hover:bg-transparent hover:text-primary"
              onClick={() => setIsExpanded((previous) => !previous)}
              aria-expanded={isExpanded}
            >
              {isExpanded ? (
                <ChevronUp className="h-[14px] w-[14px]" />
              ) : (
                <ChevronDown className="h-[14px] w-[14px]" />
              )}
              {isExpanded ? 'Less' : 'More'}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
          <span className="inline-flex rounded-[4px] bg-[rgba(30,102,247,0.1)] px-1 py-0.5 text-xs font-semibold uppercase text-primary">
            {job.department}
          </span>
          <span className="text-sm font-normal tracking-[-0.1504px] text-[#666]">
            {job.employmentType}
          </span>
          <span className="text-sm font-normal tracking-[-0.1504px] text-[#666]">
            {job.workMode}
          </span>
        </div>
      </div>

      <div
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
          isExpanded
            ? 'grid-rows-[1fr] opacity-100'
            : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="min-h-0 overflow-hidden py-6">
          <Tabs defaultValue="job-detail" className="w-full">
            <TabsList className="h-auto w-full gap-2 rounded-none bg-transparent px-6 py-0">
              <TabsTrigger
                value="job-detail"
                className="h-auto flex-1 rounded-b-none rounded-t-[12px] border border-transparent bg-[#f3f3f3] px-6 py-[9px] text-sm font-medium tracking-[-0.1504px] text-black !shadow-none data-[state=active]:border-[#e5e5e5] data-[state=active]:bg-white data-[state=active]:!shadow-none"
              >
                Job Detail
              </TabsTrigger>
              <TabsTrigger
                value="applicants"
                className="h-auto flex-1 rounded-b-none rounded-t-[12px] border border-transparent bg-[#f3f3f3] px-6 py-[9px] text-sm font-medium tracking-[-0.1504px] text-black !shadow-none data-[state=active]:border-[#e5e5e5] data-[state=active]:bg-white data-[state=active]:!shadow-none"
              >
                Applicants ({job.applicants.length})
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="h-auto flex-1 rounded-b-none rounded-t-[12px] border border-transparent bg-[#f3f3f3] px-6 py-[9px] text-sm font-medium tracking-[-0.1504px] text-black !shadow-none data-[state=active]:border-[#e5e5e5] data-[state=active]:bg-white data-[state=active]:!shadow-none"
              >
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="job-detail" className="mt-0 px-6 pt-6">
              <JobDetailTab job={job} />
            </TabsContent>
            <TabsContent value="applicants" className="mt-0 px-6 pt-6">
              <ApplicantsTab job={job} historyMode={historyMode} />
            </TabsContent>
            <TabsContent value="analytics" className="mt-0 px-6 pt-6">
              <AnalyticsTab job={job} />
            </TabsContent>
          </Tabs>

          <div className="mt-6 px-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Button
                type="button"
                variant="outline"
                className="h-[36px] w-full rounded-[6px] border-[#ff3b30] text-sm text-[#ff3b30] hover:bg-[#fff1f0]"
              >
                Close Job
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-[36px] w-full rounded-[6px] border-[#e5e5e5] text-sm text-black hover:bg-white"
              >
                <Pencil className="h-4 w-4" />
                Edit Job
              </Button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
