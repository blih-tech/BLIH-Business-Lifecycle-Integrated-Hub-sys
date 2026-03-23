'use client';

import { MapPin, SearchCheck, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';

import type { CareerJob } from '@/features/careers/data';
import { CareerJobDetailDialog } from '@/features/careers/components/career-job-detail-dialog';

type CareersPageContentProps = {
  jobs: CareerJob[];
};

export function CareersPageContent({ jobs }: CareersPageContentProps) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const selectedJob = useMemo(
    () => jobs.find((job) => job.slug === selectedSlug) ?? null,
    [jobs, selectedSlug],
  );

  return (
    <>
      <main className="mx-auto w-full max-w-[1120px] space-y-8 px-4 py-10 md:px-6 md:py-12">
        <section className="overflow-hidden rounded-[28px] border border-border/70 bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_45%,#dbeafe_130%)] px-6 py-8 text-white md:px-8 md:py-10">
          <div className="max-w-[720px] space-y-4">
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium tracking-[0.12em] uppercase text-white/90">
              Careers
            </span>
            <h1 className="text-3xl font-semibold tracking-[-0.04em] md:text-5xl">
              Join the teams building how BLIH works.
            </h1>
            <p className="max-w-[620px] text-sm leading-6 text-white/80 md:text-base">
              Browse open roles, review the full job details, and apply through
              the form configured for each post.
            </p>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border/70 bg-card px-4 py-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <SearchCheck className="h-4 w-4 text-primary" />
              Open Roles
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              {jobs.length}
            </p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-card px-4 py-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <MapPin className="h-4 w-4 text-primary" />
              Locations
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              {new Set(jobs.map((job) => job.location)).size}
            </p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-card px-4 py-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              Teams Hiring
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              {new Set(jobs.map((job) => job.department)).size}
            </p>
          </div>
        </section>

        {jobs.length > 0 ? (
          <section className="grid gap-4 md:grid-cols-2">
            {jobs.map((job) => (
              <article
                key={job.slug}
                className="cursor-pointer rounded-[24px] border border-border/70 bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm"
                role="button"
                tabIndex={0}
                onClick={() => setSelectedSlug(job.slug)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setSelectedSlug(job.slug);
                  }
                }}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex rounded-md border border-border bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground">
                        {job.departmentLabel}
                      </span>
                      <span className="inline-flex rounded-md border border-border bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                        {job.experienceLevelLabel}
                      </span>
                    </div>
                    <h2 className="mt-3 text-xl font-semibold tracking-tight text-foreground">
                      {job.title}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {job.location} · {job.employmentTypeLabel} ·{' '}
                      {job.workModeLabel}
                    </p>
                  </div>
                  <span className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {job.salaryLabel}
                  </span>
                </div>

                <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted-foreground">
                  {job.summary}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {job.requirements.slice(0, 3).map((item) => (
                    <span
                      key={`${job.slug}-${item}`}
                      className="inline-flex rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className="rounded-2xl border border-dashed border-border bg-card px-4 py-12 text-center">
            <p className="text-lg font-semibold text-foreground">
              No open roles right now
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Check back later for new opportunities.
            </p>
          </section>
        )}
      </main>

      <CareerJobDetailDialog
        job={selectedJob}
        onOpenChange={(open) => {
          if (!open) setSelectedSlug(null);
        }}
      />
    </>
  );
}
