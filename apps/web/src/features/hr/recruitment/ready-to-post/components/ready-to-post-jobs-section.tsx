"use client";

import { useMemo, useState } from "react";

import { JobPostCard } from "@/features/hr/recruitment/ready-to-post/components/job-post-card";
import { JobPostPreviewDialog } from "@/features/hr/recruitment/ready-to-post/components/job-post-preview-dialog";
import type { JobPostItem } from "@/features/hr/recruitment/ready-to-post/types";

type ReadyToPostJobsSectionProps = {
  items: JobPostItem[];
};

export function ReadyToPostJobsSection({ items }: ReadyToPostJobsSectionProps) {
  const [previewId, setPreviewId] = useState<string | null>(null);

  const previewItem = useMemo(
    () => items.find((item) => item.id === previewId) ?? null,
    [items, previewId],
  );

  return (
    <>
      <section className="space-y-3">
        {items.map((item) => (
          <JobPostCard key={item.id} item={item} onPreviewClick={() => setPreviewId(item.id)} />
        ))}
      </section>

      <JobPostPreviewDialog
        item={previewItem}
        onOpenChange={(isOpen) => {
          if (!isOpen) setPreviewId(null);
        }}
      />
    </>
  );
}
