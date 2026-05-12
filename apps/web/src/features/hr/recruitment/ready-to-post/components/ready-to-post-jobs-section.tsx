'use client';

import { useMemo, useState } from 'react';

import { JobPostCard } from '@/features/hr/recruitment/ready-to-post/components/job-post-card';
import { JobPostPreviewDialog } from '@/features/hr/recruitment/ready-to-post/components/job-post-preview-dialog';
import type { ReadyToPostJob } from '@/features/hr/recruitment/ready-to-post/types';

type ReadyToPostJobsSectionProps = {
  items: ReadyToPostJob[];
  onPostJob?: (job: ReadyToPostJob) => void;
};

export function ReadyToPostJobsSection({
  items,
  onPostJob,
}: ReadyToPostJobsSectionProps) {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const previewItem = useMemo(
    () => (previewIndex === null ? null : (items[previewIndex] ?? null)),
    [items, previewIndex],
  );
  return (
    <>
      <section className="space-y-3">
        {items.map((item, index) => (
          <JobPostCard
            key={`${item.jobDetailsForm.title}-${index}`}
            item={item}
            onPreviewClick={() => setPreviewIndex(index)}
            onPostClick={() => onPostJob?.(item)}
          />
        ))}
      </section>

      <JobPostPreviewDialog
        item={previewItem}
        onPost={() => {
          if (previewItem) onPostJob?.(previewItem);
        }}
        onOpenChange={(isOpen) => {
          if (!isOpen) setPreviewIndex(null);
        }}
      />
    </>
  );
}
