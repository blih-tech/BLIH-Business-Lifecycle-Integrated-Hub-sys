'use client';

import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

import type { ProbationEmployee } from '@/features/hr/onboarding/probation/types';
import { Button } from '@/shared/components/ui/button';

type ProbationCardProps = {
  employee: ProbationEmployee;
  defaultExpanded?: boolean;
};

export function ProbationCard({
  employee,
  defaultExpanded = false,
}: ProbationCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <article className="overflow-hidden rounded-[12px] border border-[#e5e5e5] bg-white">
      <div className="space-y-3.5 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#1e66f7] text-base font-semibold tracking-[-0.3125px] text-white">
              {employee.avatarText}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-base font-medium leading-4 tracking-[-0.3125px] text-black">
                  {employee.name}
                </p>
                <span className="inline-flex rounded-[4px] bg-[rgba(30,102,247,0.1)] px-1 py-0.5 text-xs font-semibold uppercase leading-4 text-[#1e66f7]">
                  {employee.department}
                </span>
              </div>
              <p className="mt-1 text-sm tracking-[-0.1504px] text-[#666]">
                {employee.role}
              </p>
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

        <div className="grid gap-4 lg:grid-cols-[1fr_299px]">
          <div className="grid h-[60px] grid-cols-3 items-center gap-3 rounded-[8px] bg-[#f5f5f5] px-4 py-2">
            <div>
              <p className="text-xs leading-4 text-[#666]">Start Date</p>
              <p className="mt-1 text-sm font-semibold tracking-[-0.1504px] text-black">
                {employee.startDate}
              </p>
            </div>
            <div>
              <p className="text-xs leading-4 text-[#666]">End Date</p>
              <p className="mt-1 text-sm font-semibold tracking-[-0.1504px] text-black">
                {employee.endDate}
              </p>
            </div>
            <div>
              <p className="text-xs leading-4 text-[#666]">Days Remaining</p>
              <p className="mt-1 text-sm font-semibold tracking-[-0.3125px] text-primary">
                {employee.daysRemaining}
              </p>
            </div>
          </div>

          <div className="relative flex h-[60px] items-center justify-between rounded-[8px] border border-primary bg-[rgba(30,102,247,0.1)] px-4 py-2">
            <div>
              <p className="text-base font-semibold tracking-[-0.3125px] text-black">
                Automated Score
              </p>
              <p className="text-xs leading-4 text-[#666]">
                Based on KPI, OKR, and review data
              </p>
            </div>
            <p className="text-3xl font-bold tracking-[0.3955px] text-primary">
              {employee.automatedScore}
            </p>
            <Sparkles className="absolute right-14 top-1 h-4 w-4 text-[#f0c419]" />
          </div>
        </div>
      </div>

      <div
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
          isExpanded
            ? 'grid-rows-[1fr] opacity-100'
            : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="min-h-0 overflow-hidden border-t border-[#e5e5e5] px-5 py-3.5">
          <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
            <section>
              <h3 className="text-base font-semibold tracking-[-0.3125px] text-black">
                Reviews
              </h3>
              <div className="mt-3 space-y-3">
                {employee.reviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-[8px] bg-[#f5f5f5] p-3"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10px] leading-4 text-[#666]">
                          {review.dateLabel}
                        </p>
                        <p className="text-sm font-semibold tracking-[-0.1504px] text-black">
                          {review.dateValue}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] leading-4 text-[#666]">
                          {review.scoreLabel}
                        </p>
                        <p className="text-[32px] font-semibold leading-8 tracking-[0.0703px] text-primary">
                          {review.scoreValue}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] leading-4 text-[#666]">
                          Reviewer
                        </p>
                        <p className="text-sm font-semibold tracking-[-0.1504px] text-black">
                          {review.reviewer}
                        </p>
                        {review.note ? (
                          <p className="text-[10px] font-medium text-primary">
                            {review.note}
                          </p>
                        ) : null}
                      </div>
                      <div>
                        {review.followUpLabel ? (
                          <div className="rounded-[6px] bg-[rgba(30,102,247,0.1)] px-2 py-1">
                            <p className="text-[10px] leading-4 text-primary">
                              {review.followUpLabel}
                            </p>
                            <p className="text-sm font-semibold tracking-[-0.1504px] text-black">
                              {review.followUpValue}
                            </p>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="flex flex-col justify-between">
              <div>
                <h3 className="text-base font-semibold tracking-[-0.3125px] text-black">
                  KPI Performance
                </h3>
                <div className="mt-3 space-y-4">
                  {employee.kpiMetrics.map((metric) => (
                    <div key={metric.id}>
                      <div className="mb-1 flex items-center justify-between">
                        <p className="text-sm tracking-[-0.1504px] text-[#666]">
                          {metric.label}
                        </p>
                        <p className="text-xs tracking-[-0.1504px] text-[#666]">
                          {metric.score}
                        </p>
                      </div>
                      <div className="h-1.5 rounded-full bg-[#c7d7fb]">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${metric.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex items-center justify-between">
                  <p className="text-base font-semibold tracking-[-0.3125px] text-black">
                    Overall KPI Score
                  </p>
                  <p className="text-3xl font-bold tracking-[0.3955px] text-primary">
                    {employee.overallScore}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  className="h-8 rounded-[6px] border-[#d9d9d9] bg-white text-sm font-medium tracking-[-0.1504px] text-black hover:bg-white"
                  asChild
                >
                  <Link
                    href={`/dashboard/hr/onboarding/probation/${employee.id}/evaluations`}
                  >
                    Preview Evaluations
                  </Link>
                </Button>
                <Button
                  type="button"
                  className="h-8 rounded-[6px] text-sm font-medium tracking-[-0.1504px]"
                  asChild
                >
                  <Link
                    href={`/dashboard/hr/onboarding/probation/${employee.id}/kpi`}
                  >
                    Give Evaluation
                  </Link>
                </Button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </article>
  );
}
