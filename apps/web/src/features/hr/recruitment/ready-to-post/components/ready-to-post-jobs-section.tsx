"use client";

import { useMemo, useState } from "react";

import { JobPostCard } from "@/features/hr/recruitment/ready-to-post/components/job-post-card";
import { JobPostPreviewDialog } from "@/features/hr/recruitment/ready-to-post/components/job-post-preview-dialog";
import type { ReadyToPostJob } from "@/features/hr/recruitment/ready-to-post/types";

type ReadyToPostJobsSectionProps = {
  items: ReadyToPostJob[];
};

function requestIdLabel(index: number) {
  return `REQ-${String(index + 1).padStart(3, "0")}`;
}

export function ReadyToPostJobsSection({ items }: ReadyToPostJobsSectionProps) {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const previewItem = useMemo(
    () => (previewIndex === null ? null : items[previewIndex] ?? null),
    [items, previewIndex],
  );
  const previewRequestId = useMemo(
    () => (previewIndex === null ? null : requestIdLabel(previewIndex)),
    [previewIndex],
  );

  return (
    <>
      <section className="space-y-3">
        {items.map((item, index) => (
          <JobPostCard
            key={`${item.jobDetailsForm.jobTitle}-${index}`}
            item={item}
            requestId={requestIdLabel(index)}
            onPreviewClick={() => setPreviewIndex(index)}
          />
        ))}
      </section>

      <JobPostPreviewDialog
        item={previewItem}
        requestId={previewRequestId}
        onOpenChange={(isOpen) => {
          if (!isOpen) setPreviewIndex(null);
        }}
      />
    </>
  );
}
