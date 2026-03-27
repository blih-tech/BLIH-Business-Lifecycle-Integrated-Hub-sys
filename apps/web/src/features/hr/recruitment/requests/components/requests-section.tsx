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
import { useMemo, useState } from 'react';

type RequestsSectionProps = {
  title: string;
  subtitle: string;
  items: FullJobRequest[];
  currentUserName: string;
  includeFilter?: boolean;
  isLoading?: boolean;
};

export function RequestsSection({
  title,
  subtitle,
  items,
  currentUserName,
  includeFilter = false,
  isLoading = false,
}: RequestsSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<
    string | undefined
  >();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [jobTypeFilter, setJobTypeFilter] = useState<string | undefined>();
  const [positionsFilter, setPositionsFilter] = useState<string | undefined>();
  const [seniorityFilter, setSeniorityFilter] = useState<string | undefined>();
  const [sortBy, setSortBy] = useState<string | undefined>();

  const filteredItems = useMemo(() => {
    if (!includeFilter) return items;

    const normalizedSearch = searchQuery.trim().toLowerCase();
    const normalizedDepartment = departmentFilter?.toLowerCase();
    const normalizedJobType = jobTypeFilter?.toLowerCase();
    const normalizedSeniority = seniorityFilter?.toLowerCase();
    const normalizedStatus = statusFilter?.toLowerCase();
    const today = new Date();

    const matchesDepartment = (value?: string) => {
      if (!normalizedDepartment) return true;
      if (!value) return false;
      const normalizedValue = value.toLowerCase();
      if (
        ['technical', 'creative', 'digital_marketing'].includes(normalizedValue)
      ) {
        return normalizedValue === normalizedDepartment;
      }
      return true;
    };

    const isExpired = (request: FullJobRequest) => {
      const deadline =
        request.jobDetailsForm.applicationDeadline ||
        request.requestForm.neededByDate ||
        '';
      if (!deadline) return false;
      const parsed = new Date(deadline);
      if (Number.isNaN(parsed.getTime())) return false;
      return parsed < today;
    };

    const matchesStatus = (request: FullJobRequest) => {
      if (!normalizedStatus) return true;
      if (normalizedStatus === 'expired') return isExpired(request);
      if (normalizedStatus === 'active') return !isExpired(request);
      return true;
    };

    const matchesPositions = (value?: string) => {
      if (!positionsFilter) return true;
      const numeric = Number(value);
      if (Number.isNaN(numeric)) return false;
      if (positionsFilter === '3') return numeric >= 3;
      return numeric === Number(positionsFilter);
    };

    const matchesSeniority = (value?: string) => {
      if (!normalizedSeniority) return true;
      if (!value) return false;
      return value.toLowerCase() === normalizedSeniority;
    };

    const results = items.filter((request) => {
      const titleValue =
        request.requestForm.jobTitle ?? request.jobDetailsForm.title ?? '';
      if (
        normalizedSearch &&
        !titleValue.toLowerCase().includes(normalizedSearch)
      ) {
        return false;
      }

      if (!matchesDepartment(request.requestForm.department)) return false;
      if (!matchesStatus(request)) return false;

      if (normalizedJobType) {
        const typeValue = request.requestForm.employmentType ?? '';
        if (typeValue.toLowerCase() !== normalizedJobType) return false;
      }

      if (!matchesPositions(request.requestForm.openings)) return false;
      if (!matchesSeniority(request.jobDetailsForm.experienceLevel))
        return false;

      return true;
    });

    if (!sortBy) return results;

    if (sortBy === 'name') {
      return [...results].sort((a, b) =>
        (a.requestForm.jobTitle ?? '').localeCompare(
          b.requestForm.jobTitle ?? '',
        ),
      );
    }

    if (sortBy === 'date') {
      return [...results].sort((a, b) => {
        const aDate = new Date(a.requestForm.createdDate ?? 0).getTime();
        const bDate = new Date(b.requestForm.createdDate ?? 0).getTime();
        return bDate - aDate;
      });
    }

    return results;
  }, [
    departmentFilter,
    includeFilter,
    items,
    jobTypeFilter,
    positionsFilter,
    searchQuery,
    seniorityFilter,
    sortBy,
    statusFilter,
  ]);

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
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
              {/* <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#e5e5e5] bg-white text-xs text-[#666]"
                aria-label="Filters"
              >
                &#x2630;
              </button> */}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={departmentFilter}
                onValueChange={setDepartmentFilter}
              >
                <SelectTrigger className="h-9 w-[120px] bg-white">
                  <SelectValue placeholder="Marketing" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="digital_marketing">Marketing</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 w-[120px] bg-white">
                  <SelectValue placeholder="Expired" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                </SelectContent>
              </Select>
              <Select value={jobTypeFilter} onValueChange={setJobTypeFilter}>
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
              <Select
                value={positionsFilter}
                onValueChange={setPositionsFilter}
              >
                <SelectTrigger className="h-9 w-[120px] bg-white">
                  <SelectValue placeholder="No of Positions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3+</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={seniorityFilter}
                onValueChange={setSeniorityFilter}
              >
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
            <span>{filteredItems.length} jobs found</span>
            <div className="flex items-center gap-2">
              <span>Sort by:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
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
      <JobRequestsSection
        items={filteredItems}
        currentUserName={currentUserName}
        isLoading={isLoading}
      />
    </section>
  );
}
