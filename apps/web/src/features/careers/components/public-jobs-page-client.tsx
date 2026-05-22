'use client';

import { useEffect, useState } from 'react';

import type { CareerJob } from '@/features/careers/data';
import { getCareerJobs } from '@/features/careers/data';
import { PublicJobsPageContent } from '@/features/careers/components/public-jobs-page-content';

export function PublicJobsPageClient() {
  const [jobs, setJobs] = useState<CareerJob[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    getCareerJobs()
      .then((data) => {
        if (!cancelled) setJobs(data);
      })
      .catch(() => {
        if (!cancelled) setJobs([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (jobs === null) {
    return (
      <main className="mx-auto w-full max-w-[1120px] space-y-8 px-4 py-10 md:px-6 md:py-12">
        <section className="rounded-2xl border border-border/70 bg-card px-4 py-12 text-center">
          <p className="text-sm text-muted-foreground">Loading open roles…</p>
        </section>
      </main>
    );
  }

  return <PublicJobsPageContent jobs={jobs} />;
}
