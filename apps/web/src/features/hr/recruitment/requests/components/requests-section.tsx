'use client';

import type { FullJobRequest } from '@/features/hr/recruitment/requests/types';
import { JobRequestsSection } from '@/features/hr/recruitment/requests/components/job-requests-section';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

type RequestsSectionProps = {
  title: string;
  subtitle: string;
  items: FullJobRequest[];
  currentUserName: string;
  includeFilter?: boolean;
};

export function RequestsSection({
  title,
  subtitle,
  items,
  currentUserName,
  includeFilter = false,
}: RequestsSectionProps) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="ui-section-title text-foreground">{title}</h2>
        <p className="ui-body text-muted-foreground">{subtitle}</p>
      </div>
      {includeFilter ? (
        <div className="space-y-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center gap-2">
              <Input
                className="h-9 max-w-[220px] bg-white"
                placeholder="Search jobs..."
              />
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#e5e5e5] bg-white text-xs text-[#666]"
                aria-label="Filters"
              >
                &#x2630;
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select>
                <SelectTrigger className="h-9 w-[120px] bg-white">
                  <SelectValue placeholder="Marketing" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="h-9 w-[120px] bg-white">
                  <SelectValue placeholder="Expired" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="h-9 w-[120px] bg-white">
                  <SelectValue placeholder="Job Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_time">Full-time</SelectItem>
                  <SelectItem value="part_time">Part-time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="intern">Intern</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="h-9 w-[120px] bg-white">
                  <SelectValue placeholder="No of Positions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3+</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="h-9 w-[110px] bg-white">
                  <SelectValue placeholder="Senior" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="junior">Junior</SelectItem>
                  <SelectItem value="mid">Mid</SelectItem>
                  <SelectItem value="senior">Senior</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between text-[12px] text-[#666]">
            <span>8 jobs found</span>
            <div className="flex items-center gap-2">
              <span>Sort by:</span>
              <Select>
                <SelectTrigger className="h-8 w-[120px] bg-white">
                  <SelectValue placeholder="Name" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      ) : null}
      <JobRequestsSection items={items} currentUserName={currentUserName} />
    </section>
  );
}
